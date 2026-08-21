import type { ShopHours } from '../types';

export interface OpenStatusResult {
  isOpen: boolean;
  statusText: string;
  badgeColor: 'green' | 'red' | 'gray';
  todayHoursText: string;
}

export function formatHourString(openTime: string | null, closeTime: string | null, isClosed: boolean): string {
  if (isClosed || !openTime || !closeTime) return 'Closed';
  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m < 10 ? '0' : ''}${m} ${period}`;
  };
  return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
}

export function computeOpenStatus(hoursList?: ShopHours[], currentDate: Date = new Date()): OpenStatusResult {
  if (!hoursList || hoursList.length === 0) {
    return {
      isOpen: true,
      statusText: 'Open',
      badgeColor: 'green',
      todayHoursText: '08:00 AM - 08:00 PM (Default)',
    };
  }

  const currentDay = currentDate.getDay(); // 0 = Sunday
  const todayHours = hoursList.find(h => h.day_of_week === currentDay);

  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) {
    return {
      isOpen: false,
      statusText: 'Closed Today',
      badgeColor: 'red',
      todayHoursText: 'Closed Today',
    };
  }

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const [openH, openM] = todayHours.open_time.split(':').map(Number);
  const [closeH, closeM] = todayHours.close_time.split(':').map(Number);

  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);

  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    isOpen,
    statusText: isOpen ? 'Open Now' : 'Closed',
    badgeColor: isOpen ? 'green' : 'red',
    todayHoursText: formatHourString(todayHours.open_time, todayHours.close_time, todayHours.is_closed),
  };
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
