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
  const calendarService = new GoogleCalendarService();

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
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        authService.saveTokens(tokens);
        setIsAuthenticated(true);
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing tokens:', error);
        setError('Lỗi xử lý token xác thực');
      }
    }
  };

  const handleLogin = () => {
    setLoading(true);
    window.location.href = authService.getAuthUrl();
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
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const eventsData = await calendarService.getEvents(
        selectedCalendar,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Không thể tải sự kiện. Vui lòng thử lại.');
      
      if (error instanceof Error && error.message.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCalendars = async () => {
    try {
      const calendarsData = await calendarService.getCalendars();
      setCalendars(calendarsData);
    } catch (error) {
      console.error('Error loading calendars:', error);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await calendarService.createEvent(eventData, selectedCalendar);
      await loadEvents();
      setShowEventModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Không thể tạo sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>) => {
    try {
      setLoading(true);
      setError(null);
      
      await calendarService.updateEvent(eventId, eventData, selectedCalendar);
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Không thể cập nhật sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await calendarService.deleteEvent(eventId, selectedCalendar);
      await loadEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Không thể xóa sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
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

  // Loading screen
  if (loading && events.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Not authenticated screen
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch Google</h1>
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Đăng nhập để tiếp tục</h2>
            <p className="text-gray-600 mb-6">
              Bạn cần đăng nhập với tài khoản Google để sử dụng tính năng lịch.
            </p>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>💡 Cần setup Google API credentials trước</p>
              <p>Xem file GOOGLE_SETUP_GUIDE.md để biết cách setup</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lịch Google</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowEventModal(true)}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Tạo sự kiện
          </button>
          <select
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {calendars.map(calendar => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.summary} {calendar.primary ? '(Chính)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tổng sự kiện</h3>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Hôm nay</h3>
          <p className="text-2xl font-bold text-blue-600">
            {getEventsForDate(new Date()).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tuần này</h3>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(event => {
              const eventDate = new Date(event.start.dateTime || event.start.date);
              const now = new Date();
              const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              return eventDate >= weekStart && eventDate <= weekEnd;
            }).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tháng này</h3>
          <p className="text-2xl font-bold text-purple-600">
            {events.filter(event => {
              const eventDate = new Date(event.start.dateTime || event.start.date);
              const now = new Date();
              return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

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
          <div className="flex space-x-2">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '🔄' : '↻'} Tải lại
            </button>
            <button
              onClick={goToToday}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Hôm nay
            </button>
          </div>
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
                  onClick={() => {
                    setSelectedDate(day.date);
                    setShowEventModal(true);
                  }}
                >
                  <div className="font-medium text-sm mb-1">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer hover:bg-blue-200"
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
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm border border-blue-200 hover:bg-blue-50"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm border border-red-200 hover:bg-red-50 disabled:opacity-50"
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
                  onClick={() => deleteEvent(selectedEvent.id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Xóa sự kiện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo sự kiện mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const startDate = formData.get('startDate') as string;
                const startTime = formData.get('startTime') as string;
                const endDate = formData.get('endDate') as string;
                const endTime = formData.get('endTime') as string;
                
                const eventData = {
                  summary: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  start: {
                    dateTime: `${startDate}T${startTime}:00`,
                    timeZone: 'Asia/Ho_Chi_Minh'
                  },
                  end: {
                    dateTime: `${endDate}T${endTime}:00`,
                    timeZone: 'Asia/Ho_Chi_Minh'
                  }
                };
                
                createEvent(eventData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề sự kiện"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu *</label>
                      <input
                        type="time"
                        name="startTime"
                        required
                        defaultValue="09:00"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc *</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="endTime"
                        required
                        defaultValue="10:00"
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
                      placeholder="Nhập địa điểm (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập mô tả sự kiện (tùy chọn)"
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
