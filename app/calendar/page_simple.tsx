'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  category: 'work' | 'meeting' | 'maintenance' | 'personal' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export default function SimpleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error loading events:', error);
      }
    } else {
      // Tạo một số sự kiện mẫu
      const sampleEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Họp team hàng tuần',
          description: 'Báo cáo tiến độ dự án và thảo luận vấn đề',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          location: 'Phòng họp A',
          category: 'meeting',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Bảo trì máy in',
          description: 'Kiểm tra và vệ sinh máy in tầng 2',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:00',
          category: 'maintenance',
          priority: 'medium'
        }
      ];
      setEvents(sampleEvents);
      localStorage.setItem('calendar_events', JSON.stringify(sampleEvents));
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);

  const createEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventModal(false);
    setSelectedDate(null);
  };

  const updateEvent = (eventId: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...eventData } : event
    ));
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSelectedEvent(null);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
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

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      personal: 'bg-purple-100 text-purple-800',
      reminder: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.reminder;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lịch làm việc</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Tạo sự kiện
          </button>
        </div>
      </div>

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
          <h3 className="text-sm font-medium text-gray-500">Ưu tiên cao</h3>
          <p className="text-2xl font-bold text-red-600">
            {events.filter(e => e.priority === 'high').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Hoàn thành</h3>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.completed).length}
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
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-75 ${getCategoryColor(event.category)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        {getPriorityIcon(event.priority)} {event.startTime} {event.title.substring(0, 12)}
                        {event.title.length > 12 && '...'}
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
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPriorityIcon(event.priority)}</div>
                    <div>
                      <h4 className="font-medium flex items-center space-x-2">
                        <span>{event.title}</span>
                        {event.completed && <span className="text-green-500">✓</span>}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {event.startTime} - {event.endTime}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500">📍 {event.location}</p>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateEvent(event.id, { completed: !event.completed })}
                      className={`px-3 py-1 rounded text-sm ${
                        event.completed 
                          ? 'bg-gray-200 text-gray-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {event.completed ? 'Hoàn thành' : 'Đánh dấu'}
                    </button>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm border border-blue-200 hover:bg-blue-50"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm border border-red-200 hover:bg-red-50"
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
                  <p className="text-gray-900 flex items-center space-x-2">
                    <span>{getPriorityIcon(selectedEvent.priority)}</span>
                    <span>{selectedEvent.title}</span>
                    {selectedEvent.completed && <span className="text-green-500">✓</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                  <p className="text-gray-900">
                    {new Date(selectedEvent.date).toLocaleDateString('vi-VN')}
                    <br />
                    {selectedEvent.startTime} - {selectedEvent.endTime}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getCategoryColor(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setSelectedEvent(null);
                    setShowEventModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Xóa sự kiện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const eventData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  date: formData.get('date') as string,
                  startTime: formData.get('startTime') as string,
                  endTime: formData.get('endTime') as string,
                  location: formData.get('location') as string,
                  category: formData.get('category') as CalendarEvent['category'],
                  priority: formData.get('priority') as CalendarEvent['priority'],
                  completed: false
                };
                
                if (editingEvent) {
                  updateEvent(editingEvent.id, eventData);
                } else {
                  createEvent(eventData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingEvent?.title || ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={editingEvent?.date || (selectedDate ? selectedDate.toISOString().split('T')[0] : '')}
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
                        defaultValue={editingEvent?.startTime || '09:00'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="endTime"
                        required
                        defaultValue={editingEvent?.endTime || '10:00'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingEvent?.location || ''}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                    <select
                      name="category"
                      defaultValue={editingEvent?.category || 'work'}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="work">Công việc</option>
                      <option value="meeting">Họp</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="personal">Cá nhân</option>
                      <option value="reminder">Nhắc nhở</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ưu tiên</label>
                    <select
                      name="priority"
                      defaultValue={editingEvent?.priority || 'medium'}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Thấp 🟢</option>
                      <option value="medium">Trung bình 🟡</option>
                      <option value="high">Cao 🔴</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingEvent?.description || ''}
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
                      setEditingEvent(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
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
