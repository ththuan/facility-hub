'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthService } from '@/lib/googleAuthService';
import { GoogleCalendarService, CalendarEvent } from '@/lib/googleCalendarService';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendars, setCalendars] = useState<Array<{ id: string; summary: string; primary?: boolean }>>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');

  const authService = GoogleAuthService.getInstance();
  const calendarService = GoogleCalendarService.getInstance();

  useEffect(() => {
    checkAuthentication();
    handleAuthCallback();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
      loadCalendars();
    }
  }, [isAuthenticated, currentDate, selectedCalendar]);

  const checkAuthentication = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const handleAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const tokensParam = urlParams.get('tokens');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(`Lỗi xác thực: ${errorParam}`);
      return;
    }

    if (authStatus === 'success' && tokensParam) {
      try {
        const tokens = JSON.parse(atob(tokensParam));
        authService.saveTokens(tokens);
        setIsAuthenticated(true);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error processing auth callback:', error);
        setError('Lỗi xử lý xác thực');
      }
    }
  };

  const handleGoogleLogin = () => {
    const authUrl = authService.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    authService.clearTokens();
    setIsAuthenticated(false);
    setEvents([]);
    setCalendars([]);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        setIsAuthenticated(false);
        return;
      }

      await calendarService.initialize(tokens.access_token);
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const fetchedEvents = await calendarService.getEvents(
        selectedCalendar,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Không thể tải sự kiện từ Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendars = async () => {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) return;

      await calendarService.initialize(tokens.access_token);
      const calendarList = await calendarService.getCalendarList();
      setCalendars(calendarList);
    } catch (error) {
      console.error('Error loading calendars:', error);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      setLoading(true);
      const newEvent = await calendarService.createEvent(eventData, selectedCalendar);
      await loadEvents(); // Reload events
      setShowEventModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    
    try {
      setLoading(true);
      await calendarService.deleteEvent(eventId, selectedCalendar);
      await loadEvents(); // Reload events
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Không thể xóa sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return eventDate.toDateString() === dateStr;
    });
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const calendar = [];
    const currentDateForCalendar = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDateForCalendar);
        const dayEvents = getEventsForDate(date);
        
        weekDays.push({
          date: new Date(date),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === new Date().toDateString(),
          events: dayEvents
        });
        
        currentDateForCalendar.setDate(currentDateForCalendar.getDate() + 1);
      }
      calendar.push(weekDays);
      
      if (currentDateForCalendar > lastDay && week >= 4) {
        break;
      }
    }
    
    return calendar;
  };

  const monthNames = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kết nối Google Calendar</h2>
            <p className="text-gray-600 mb-6">
              Đăng nhập với Google để đồng bộ lịch làm việc của bạn
            </p>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lịch làm việc</h1>
        <div className="flex space-x-4">
          <select
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {calendars.map((cal) => (
              <option key={cal.id} value={cal.id}>
                {cal.summary} {cal.primary ? '(Chính)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Tạo sự kiện
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              →
            </button>
          </div>
          <button
            onClick={goToToday}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Hôm nay
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    min-h-24 p-2 border rounded cursor-pointer transition-colors
                    ${day.isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400'}
                    ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="font-medium text-sm mb-1">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        {GoogleCalendarService.formatEventTime(event)} {event.summary.substring(0, 15)}
                        {event.summary.length > 15 && '...'}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{day.events.length - 2} khác
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Today's Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Sự kiện hôm nay</h3>
        </div>
        <div className="p-4">
          {getEventsForDate(new Date()).length === 0 ? (
            <p className="text-gray-500">Không có sự kiện nào hôm nay</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(new Date()).map((event, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.summary}</h4>
                    <p className="text-sm text-gray-600">
                      {GoogleCalendarService.formatEventTime(event)}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">📍 {event.location}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => event.id && deleteEvent(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết sự kiện</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                  <p className="text-gray-900">{selectedEvent.summary}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                  <p className="text-gray-900">
                    {GoogleCalendarService.formatEventDate(selectedEvent)}
                    <br />
                    {GoogleCalendarService.formatEventTime(selectedEvent)}
                  </p>
                </div>
                {selectedEvent.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}
                {selectedEvent.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <p className="text-gray-900">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => selectedEvent.id && deleteEvent(selectedEvent.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Xóa sự kiện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo sự kiện mới</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const startDateTime = `${formData.get('date')}T${formData.get('startTime')}:00`;
                const endDateTime = `${formData.get('date')}T${formData.get('endTime')}:00`;
                
                await createEvent({
                  summary: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  start: {
                    dateTime: new Date(startDateTime).toISOString(),
                    timeZone: 'Asia/Ho_Chi_Minh'
                  },
                  end: {
                    dateTime: new Date(endDateTime).toISOString(),
                    timeZone: 'Asia/Ho_Chi_Minh'
                  }
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu *</label>
                      <input
                        type="time"
                        name="startTime"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="endTime"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
                    <input
                      type="text"
                      name="location"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setSelectedDate(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
