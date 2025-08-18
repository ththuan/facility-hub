'use client';

import { useState, useEffect } from 'react';
import { GoogleAuthService } from '@/lib/googleAuthService';
import { GoogleCalendarService, CalendarEvent as ServiceCalendarEvent } from '@/lib/googleCalendarService';

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

export default function CalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<ServiceCalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ServiceCalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [eventDetail, setEventDetail] = useState<ServiceCalendarEvent | null>(null);

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
    // Check both token formats for compatibility
    const token = localStorage.getItem('google_access_token');
    const tokens = localStorage.getItem('google_tokens');
    
    console.log('Check auth status:', {
      hasDirectToken: !!token,
      hasTokensObj: !!tokens,
      hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    });
    
    if (token || tokens) {
      setIsAuthenticated(true);
      loadCalendarsAndEvents();
    } else if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      // If we have real credentials, don't auto-setup demo
      console.log('Real Google credentials detected, waiting for user login');
      setIsAuthenticated(false);
    } else {
      // Auto-setup demo tokens for testing only if no real credentials
      console.log('Setting up demo tokens for testing');
      const demoToken = 'mock_access_token_demo_' + Date.now();
      localStorage.setItem('google_access_token', demoToken);
      localStorage.setItem('google_tokens', JSON.stringify({
        access_token: demoToken,
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
        token_type: 'Bearer'
      }));
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
          
          localStorage.setItem('google_tokens', JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in
          }));
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
      // Redirect to Google OAuth
      const authUrl = GoogleAuthService.getInstance().getAuthUrl();
      window.location.href = authUrl;
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
      
      // Debug: Check tokens
      const accessToken = localStorage.getItem('google_access_token');
      const tokens = localStorage.getItem('google_tokens');
      console.log('Debug tokens:', {
        hasAccessToken: !!accessToken,
        hasTokens: !!tokens,
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
        tokensObj: tokens ? JSON.parse(tokens) : null
      });
      
      // Set mock calendars for now
      const mockCalendars = [
        { id: 'primary', summary: 'Lịch chính', primary: true }
      ];
      setCalendars(mockCalendars);
      
      // Try to load real events from Google Calendar API
      const calendarService = new GoogleCalendarService();
      
      try {
        // Get events from 1 month ago to 3 months in the future
        const timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 1);
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 3);
        
        console.log('Loading events from', timeMin.toISOString(), 'to', timeMax.toISOString());
        
        const eventList = await calendarService.getEvents(
          selectedCalendar, 
          timeMin.toISOString(), 
          timeMax.toISOString(),
          100 // Get more events
        );
        
        console.log('Loaded events from Google Calendar:', eventList.length);
        setEvents(eventList);
        setError(null); // Clear any previous errors
        
        if (eventList.length === 0) {
          console.log('No events found in the specified time range');
        }
      } catch (apiError) {
        console.error('Google Calendar API error:', apiError);
        
        // If we get 401 error, it means token is invalid
        if (apiError instanceof Error && apiError.message.includes('401')) {
          setError('Token đã hết hạn. Vui lòng đăng nhập lại Google.');
          // Clear invalid tokens
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_tokens');
          localStorage.removeItem('google_refresh_token');
          localStorage.removeItem('google_token_expires');
          setIsAuthenticated(false);
        } else {
          // For other errors, show the error but don't logout
          setError('Lỗi tải dữ liệu Calendar: ' + (apiError as Error).message);
        }
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Lỗi tải dữ liệu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('Đang đọc file CSV...');
    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportStatus('❌ File CSV không có dữ liệu hợp lệ');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected CSV format: subject,start_date,start_time,end_date,end_time,description,location
      const requiredFields = ['subject', 'start_date', 'start_time'];
      const missingFields = requiredFields.filter(field => 
        !headers.some(h => h.includes(field) || h.includes('title') || h.includes('summary'))
      );

      if (missingFields.length > 0) {
        setImportStatus('❌ CSV thiếu các trường bắt buộc. Cần có: Subject/Title, Start Date, Start Time');
        return;
      }

      setImportStatus(`Đang import ${lines.length - 1} events...`);
      
      const calendarService = new GoogleCalendarService();
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const eventData: any = {};
          
          headers.forEach((header, index) => {
            eventData[header] = values[index] || '';
          });

          // Parse event data
          const summary = eventData.subject || eventData.title || eventData.summary || 'Untitled Event';
          const startDate = eventData.start_date || eventData.date;
          const startTime = eventData.start_time || '09:00';
          const endTime = eventData.end_time || eventData.end_date || '10:00';
          const description = eventData.description || eventData.notes || '';
          const location = eventData.location || '';

          if (!startDate) {
            errorCount++;
            continue;
          }

          // Create start and end datetime
          const startDateTime = new Date(`${startDate} ${startTime}`);
          const endDateTime = new Date(`${startDate} ${endTime}`);
          
          // If end time is before start time, assume next day
          if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }

          const eventToCreate = {
            summary,
            description,
            location,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: 'Asia/Ho_Chi_Minh'
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: 'Asia/Ho_Chi_Minh'
            }
          };

          await calendarService.createEvent(eventToCreate);
          successCount++;
          
          setImportStatus(`Import: ${successCount} thành công, ${errorCount} lỗi...`);
        } catch (error) {
          console.error(`Error importing event ${i}:`, error);
          errorCount++;
        }
      }

      setImportStatus(`✅ Import hoàn thành: ${successCount} events thành công, ${errorCount} lỗi`);
      
      // Refresh calendar after import
      await loadCalendarsAndEvents();
      
      // Clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000);

    } catch (error) {
      console.error('CSV Import error:', error);
      setImportStatus('❌ Lỗi đọc file CSV: ' + (error as Error).message);
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `subject,start_date,start_time,end_time,description,location
Họp team phát triển,2025-08-20,09:00,10:30,Họp review sprint và planning,Phòng họp A
Training React,2025-08-21,14:00,16:00,Khóa học React cho team frontend,Online - Zoom
Demo sản phẩm,2025-08-22,10:00,11:00,Demo tính năng mới cho khách hàng,Phòng demo
Code review,2025-08-23,15:30,16:30,Review code của sprint hiện tại,Phòng dev`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'calendar_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    GoogleAuthService.getInstance().clearTokens();
    setIsAuthenticated(false);
    setEvents([]);
    setCalendars([]);
    setError(null);
  };

  const getEventsForDate = (date: Date): ServiceCalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
            >
              {loading ? '🔄 Đang kết nối...' : '🔗 Kết nối Google Calendar'}
            </button>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-blue-800 dark:text-blue-200 text-sm">
              <p className="font-medium mb-2">✨ Tính năng:</p>
              <ul className="space-y-1 text-left">
                <li>• 📅 Xem lịch từ Google Calendar</li>
                <li>• ➕ Tạo sự kiện mới</li>
                <li>• 📄 Import hàng loạt từ file CSV</li>
                <li>• 🔄 Đồng bộ real-time</li>
              </ul>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Info banner for successful connection */}
        {isAuthenticated && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Đã kết nối với Google Calendar
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {events.length > 0 
                    ? `Đã tải ${events.length} sự kiện từ Google Calendar`
                    : 'Kết nối thành công, nhưng không có sự kiện nào trong khoảng thời gian này'
                  }
                </p>
                {events.length === 0 && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    💡 Thử tạo một sự kiện trong Google Calendar hoặc import từ file CSV
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import Status */}
        {importStatus && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📄</span>
              <span className="text-blue-800 dark:text-blue-200">{importStatus}</span>
            </div>
          </div>
        )}

        {/* CSV Import Instructions */}
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            📋 Hướng dẫn Import CSV
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            File CSV cần có các cột sau (header row đầu tiên):
          </p>
          <code className="block bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-xs mb-2">
            subject,start_date,start_time,end_time,description,location
          </code>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Ví dụ:</strong> "Họp team,2025-08-20,09:00,10:30,Họp review dự án,Phòng họp A"
          </p>
          <button
            onClick={downloadCSVTemplate}
            className="mt-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
          >
            📥 Tải file CSV mẫu
          </button>
        </div>
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">📅 Lịch Google</h1>
            <div className="flex items-center mt-2 gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                error && error.includes('Demo') 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {error && error.includes('Demo') ? '🧪 Demo Mode' : '✅ Đã kết nối'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {events.length} sự kiện
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setShowEventModal(true)}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
            >
              ➕ Tạo sự kiện
            </button>
            <button
              onClick={loadCalendarsAndEvents}
              disabled={loading}
              className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
            </button>
            <label className="w-full sm:w-auto bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm sm:text-base cursor-pointer flex items-center justify-center">
              📄 Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
            </label>
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
                const eventDate = new Date(event.start.dateTime);
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
                const eventDate = new Date(event.start.dateTime);
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
                      min-h-16 sm:min-h-20 lg:min-h-24 p-1 sm:p-2 border border-gray-200 dark:border-gray-600 rounded cursor-pointer transition-colors
                      ${day.isCurrentMonth 
                        ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white' 
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }
                      ${day.isToday ? 'ring-1 sm:ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
                    `}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setShowEventModal(true);
                    }}
                  >
                    <div className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 text-gray-900 dark:text-white">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {day.events.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs p-0.5 sm:p-1 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/70 leading-tight transition-colors border border-transparent hover:border-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEventDetail(event);
                            setShowEventDetail(true);
                          }}
                        >
                          {/* Mobile: Show only event name */}
                          <div className="block sm:hidden">
                            {event.summary.substring(0, 8)}
                            {event.summary.length > 8 && '...'}
                          </div>
                          {/* Desktop: Show time + event name */}
                          <div className="hidden sm:block">
                            {event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''} {event.summary.substring(0, 15)}
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
            <h3 className="text-base sm:text-lg font-semibold dark:text-white">
              Sự kiện hôm nay ({getEventsForDate(new Date()).length})
            </h3>
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
                        {new Date(event.start.dateTime).toLocaleString('vi-VN')}
                      </p>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setEventDetail(event);
                        setShowEventDetail(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm whitespace-nowrap transition-colors"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && eventDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  📅 Chi tiết sự kiện
                </h3>
                <button
                  onClick={() => setShowEventDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên sự kiện
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {eventDetail.summary}
                </p>
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thời gian
                </label>
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400">🕐 Bắt đầu:</span>{' '}
                    {eventDetail.start.dateTime 
                      ? new Date(eventDetail.start.dateTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Không xác định'
                    }
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400">🕐 Kết thúc:</span>{' '}
                    {eventDetail.end.dateTime 
                      ? new Date(eventDetail.end.dateTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Không xác định'
                    }
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thời lượng
                </label>
                <p className="text-gray-900 dark:text-white">
                  {eventDetail.start.dateTime && eventDetail.end.dateTime ? (
                    (() => {
                      const start = new Date(eventDetail.start.dateTime);
                      const end = new Date(eventDetail.end.dateTime);
                      const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                      if (duration >= 60) {
                        const hours = Math.floor(duration / 60);
                        const minutes = duration % 60;
                        return `⏱️ ${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`;
                      } else {
                        return `⏱️ ${duration} phút`;
                      }
                    })()
                  ) : (
                    '⏱️ Không xác định'
                  )}
                </p>
              </div>

              {/* Description */}
              {eventDetail.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {eventDetail.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {eventDetail.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Địa điểm
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    📍 {eventDetail.location}
                  </p>
                </div>
              )}

              {/* Attendees */}
              {eventDetail.attendees && eventDetail.attendees.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người tham gia ({eventDetail.attendees.length})
                  </label>
                  <div className="space-y-1">
                    {eventDetail.attendees.map((attendee, index) => (
                      <p key={index} className="text-gray-900 dark:text-white text-sm">
                        👤 {attendee.displayName || attendee.email}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Event ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID sự kiện
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {eventDetail.id}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (eventDetail.start.dateTime) {
                      const eventDate = new Date(eventDetail.start.dateTime);
                      const calendarUrl = `https://calendar.google.com/calendar/u/0/r/day/${eventDate.getFullYear()}/${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
                      window.open(calendarUrl, '_blank');
                    }
                  }}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📅 Mở trong Google Calendar
                </button>
                <button
                  onClick={() => setShowEventDetail(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
