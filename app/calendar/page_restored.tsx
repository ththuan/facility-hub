'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthService } from '@/lib/googleAuthService';
import { GoogleCalendarService } from '@/lib/googleCalendarService';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

export default function CalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar generation helpers
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  useEffect(() => {
    checkAuthStatus();
    handleAuthCallback();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      setIsAuthenticated(true);
      loadCalendarsAndEvents();
    }
  };

  const handleAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      console.log('Auth callback detected');
      const tokensParam = urlParams.get('tokens');
      if (tokensParam) {
        try {
          const tokens = JSON.parse(decodeURIComponent(tokensParam));
          console.log('Tokens from callback:', { 
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in 
          });
          
          localStorage.setItem('google_access_token', tokens.access_token);
          if (tokens.refresh_token) {
            localStorage.setItem('google_refresh_token', tokens.refresh_token);
          }
          localStorage.setItem('google_token_expires', (Date.now() + tokens.expires_in * 1000).toString());
          
          setIsAuthenticated(true);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Load data
          loadCalendarsAndEvents();
        } catch (error) {
          console.error('Error parsing tokens:', error);
          setError('Lỗi xử lý token đăng nhập');
        }
      }
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting Google login...');
      await GoogleAuthService.getInstance().login();
    } catch (error) {
      console.error('Login error:', error);
      setError('Lỗi đăng nhập: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarsAndEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load calendars
      const calendarList = await GoogleCalendarService.getCalendars();
      setCalendars(calendarList);
      
      // Load events from selected calendar
      const eventList = await GoogleCalendarService.getEvents(selectedCalendar);
      setEvents(eventList);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Lỗi tải dữ liệu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    GoogleAuthService.getInstance().logout();
    setIsAuthenticated(false);
    setEvents([]);
    setCalendars([]);
    setError(null);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks = [];
    const currentWeek = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = getEventsForDate(date);
      
      currentWeek.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek.length = 0;
      }
    }
    
    return weeks;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Lịch Google
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Kết nối với Google Calendar để xem và quản lý lịch của bạn
            </p>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 Đang kết nối...' : '🔗 Kết nối Google Calendar'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">💡 Lưu ý:</p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Cần setup Google API credentials trước</li>
                <li>• Xem file GOOGLE_SETUP_GUIDE.md để biết cách setup</li>
                <li>• Đảm bảo domain được whitelist trong Google Console</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">📅 Lịch Google</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setShowEventModal(true)}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
            >
              ➕ Tạo sự kiện
            </button>
            {calendars.length > 1 && (
              <select
                value={selectedCalendar}
                onChange={(e) => setSelectedCalendar(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {calendars.map(calendar => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.summary} {calendar.primary ? '(Chính)' : ''}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 sm:mb-6">
            <div className="flex justify-between items-start">
              <span className="text-sm sm:text-base">{error}</span>
              <button
                onClick={() => setError(null)}
                className="font-bold ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Statistics - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow border dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Tổng sự kiện</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow border dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Hôm nay</h3>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              {getEventsForDate(new Date()).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow border dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Tuần này</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {events.filter(event => {
                const eventDate = new Date(event.start.dateTime || event.start.date || '');
                const now = new Date();
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return eventDate >= weekStart && eventDate <= weekEnd;
              }).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow border dark:border-gray-700 col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Tháng này</h3>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">
              {events.filter(event => {
                const eventDate = new Date(event.start.dateTime || event.start.date || '');
                const now = new Date();
                return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>

        {/* Calendar Header - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 border-b dark:border-gray-700 gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-lg sm:text-xl"
              >
                ←
              </button>
              <h2 className="text-lg sm:text-xl font-semibold dark:text-white min-w-0">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-lg sm:text-xl"
              >
                →
              </button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={loadCalendarsAndEvents}
                disabled={loading}
                className="w-full sm:w-auto bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                {loading ? '🔄' : '↻'} Tải lại
              </button>
              <button
                onClick={goToToday}
                className="w-full sm:w-auto bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                📅 Hôm nay
              </button>
            </div>
          </div>

          {/* Calendar Grid - Mobile Responsive */}
          <div className="p-2 sm:p-4">
            {/* Day headers - Responsive */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
              {dayNames.map((day, idx) => (
                <div key={day} className="p-1 sm:p-2 text-center font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded text-xs sm:text-sm">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][idx]}</span>
                </div>
              ))}
            </div>

            {/* Calendar days - Mobile optimized */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {generateCalendar().map((week, weekIndex) =>
                week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      min-h-16 sm:min-h-20 lg:min-h-24 p-1 sm:p-2 border rounded cursor-pointer transition-colors
                      ${day.isCurrentMonth 
                        ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }
                      ${day.isToday ? 'ring-1 sm:ring-2 ring-blue-500' : ''}
                    `}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setShowEventModal(true);
                    }}
                  >
                    <div className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 dark:text-white">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {day.events.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs p-0.5 sm:p-1 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/70 leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          {/* Mobile: Show only event name */}
                          <div className="block sm:hidden">
                            {event.summary.substring(0, 8)}
                            {event.summary.length > 8 && '...'}
                          </div>
                          {/* Desktop: Show time + event name */}
                          <div className="hidden sm:block">
                            {GoogleCalendarService.formatEventTime(event)} {event.summary.substring(0, 15)}
                            {event.summary.length > 15 && '...'}
                          </div>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
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

        {/* Today's Events - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          <div className="p-3 sm:p-4 border-b dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold dark:text-white">Sự kiện hôm nay</h3>
          </div>
          <div className="p-3 sm:p-4">
            {getEventsForDate(new Date()).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Không có sự kiện nào hôm nay</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {getEventsForDate(new Date()).map((event, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base dark:text-white truncate">{event.summary}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {GoogleCalendarService.formatEventTime(event)}
                      </p>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm whitespace-nowrap"
                      >
                        Xem chi tiết →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
