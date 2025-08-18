export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export class GoogleCalendarService {
  private getAccessToken(): string {
    // Auto-get access token from localStorage - check multiple formats
    if (typeof window === 'undefined') return '';
    
    try {
      // Try getting from google_access_token first (direct format)
      const directToken = localStorage.getItem('google_access_token');
      if (directToken) {
        console.log('Found direct token:', directToken.substring(0, 20) + '...');
        return directToken;
      }
      
      // Try getting from google_tokens object format
      const tokens = localStorage.getItem('google_tokens');
      if (tokens) {
        const tokenData = JSON.parse(tokens);
        if (tokenData.access_token) {
          console.log('Found token from object:', tokenData.access_token.substring(0, 20) + '...');
          return tokenData.access_token;
        }
      }
      
      console.log('No access token found in localStorage');
      return '';
    } catch (error) {
      console.error('Error getting access token:', error);
      return '';
    }
  }

  async getEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    console.log('=== GoogleCalendarService.getEvents ===');
    console.log('Calendar ID:', calendarId);
    
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      const error = 'Access token not found. Please login first.';
      console.error(error);
      throw new Error(error);
    }

    console.log('Access token found:', accessToken.substring(0, 30) + '...');

    try {
      const params = new URLSearchParams({
        timeMin: timeMin || new Date().toISOString(),
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      if (timeMax) {
        params.append('timeMax', timeMax);
      }

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
      console.log('API URL:', url);
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken.substring(0, 30)}...`,
        'Accept': 'application/json',
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', {
        kind: data.kind,
        etag: data.etag,
        summary: data.summary,
        itemsCount: data.items ? data.items.length : 0,
        items: data.items || []
      });
      
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async createEvent(
    event: Omit<CalendarEvent, 'id'>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not found. Please login first.');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const createdEvent: CalendarEvent = await response.json();
      return createdEvent;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not found. Please login first.');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const updatedEvent: CalendarEvent = await response.json();
      return updatedEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not found. Please login first.');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async getCalendarList(): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not found. Please login first.');
    }

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  // Static utility methods
  static formatEventTime(event: CalendarEvent): string {
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  
  static formatEventDate(event: CalendarEvent): string {
    const startDate = new Date(event.start.dateTime);
    return startDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
