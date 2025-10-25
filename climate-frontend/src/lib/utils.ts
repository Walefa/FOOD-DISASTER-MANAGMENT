import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'Unknown date';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date | undefined) => {
  if (!date) return 'Unknown date';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date | undefined) => {
  if (!date) return 'Unknown time';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid time';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid time';
  }
};

export const isDateInFuture = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
};

export const isDateInPast = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
};

export const isExpiringSoon = (expiryDate: string | Date, daysThreshold: number = 30) => {
  const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  const threshold = addDays(new Date(), daysThreshold);
  return isBefore(dateObj, threshold);
};

// Number utilities
export const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

export const formatCurrency = (amount: number, currency: string = 'ZAR') => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`;
};

// Location utilities
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Severity level utilities
export const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getVulnerabilityColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'very_high':
      return 'text-red-600 bg-red-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'ongoing':
    case 'planned':
      return 'text-blue-600 bg-blue-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    case 'paused':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Disaster type utilities
export const getDisasterIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'flood':
      return '🌊';
    case 'drought':
      return '🌵';
    case 'hurricane':
      return '🌪️';
    case 'wildfire':
      return '🔥';
    case 'earthquake':
      return '🏔️';
    case 'extreme_heat':
      return '🌡️';
    case 'extreme_cold':
      return '❄️';
    case 'food_shortage':
      return '🍽️';
    default:
      return '⚠️';
  }
};

export const getDisasterColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'flood':
      return 'text-blue-600 bg-blue-50';
    case 'drought':
      return 'text-yellow-600 bg-yellow-50';
    case 'hurricane':
      return 'text-purple-600 bg-purple-50';
    case 'wildfire':
      return 'text-red-600 bg-red-50';
    case 'earthquake':
      return 'text-gray-600 bg-gray-50';
    case 'extreme_heat':
      return 'text-orange-600 bg-orange-50';
    case 'extreme_cold':
      return 'text-cyan-600 bg-cyan-50';
    case 'food_shortage':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Food category utilities
export const getFoodCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'grains':
      return '🌾';
    case 'proteins':
      return '🥩';
    case 'vegetables':
      return '🥕';
    case 'fruits':
      return '🍎';
    case 'dairy':
      return '🥛';
    case 'fats':
      return '🫒';
    case 'nutrition':
      return '🍼';
    default:
      return '🥫';
  }
};

// Role utilities
export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'text-purple-600 bg-purple-50';
    case 'ngo':
      return 'text-green-600 bg-green-50';
    case 'emergency_responder':
      return 'text-red-600 bg-red-50';
    case 'community_leader':
      return 'text-blue-600 bg-blue-50';
    case 'researcher':
      return 'text-indigo-600 bg-indigo-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Validation utilities
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Local storage utilities
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
};

// File utilities
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((groups, item) => {
    const group = (groups[item[key] as string] || []);
    group.push(item);
    groups[item[key] as string] = group;
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
};

// Chart utilities
export const generateChartColors = (count: number) => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};