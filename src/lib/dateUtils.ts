// All date operations locked to IST (Asia/Kolkata)
// IST is UTC+5:30

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Get current date/time in IST
 */
export const getISTDate = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + IST_OFFSET_MS);
};

/**
 * Convert any date to IST
 */
export const toIST = (date: Date): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + IST_OFFSET_MS);
};

/**
 * Get today's date key in YYYY-MM-DD format (IST)
 */
export const getTodayKey = (): string => {
  const ist = getISTDate();
  return getDateKey(ist);
};

/**
 * Get date key in YYYY-MM-DD format from a Date object
 */
export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get IST date from a date key string
 */
export const parseISTDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};

/**
 * Get start of day in IST
 */
export const getISTStartOfDay = (date?: Date): Date => {
  const ist = date ? toIST(date) : getISTDate();
  ist.setHours(0, 0, 0, 0);
  return ist;
};

/**
 * Get days between two dates (IST-aware)
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = getISTStartOfDay(startDate);
  const end = getISTStartOfDay(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Get array of date keys for last N days (IST)
 */
export const getLastNDays = (n: number): string[] => {
  const days: string[] = [];
  const today = getISTDate();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(getDateKey(date));
  }
  
  return days;
};

/**
 * Get all dates in a specific year (IST)
 */
export const getYearDates = (year: number): string[] => {
  const dates: string[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const today = getISTDate();
  
  for (let d = new Date(start); d <= end && d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(getDateKey(d));
  }
  
  return dates;
};

/**
 * Get month name from date
 */
export const getMonthName = (date: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
};

/**
 * Get full month name from date
 */
export const getFullMonthName = (date: Date): string => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[date.getMonth()];
};

/**
 * Check if a date is in a specific year
 */
export const isInYear = (dateKey: string, year: number): boolean => {
  return dateKey.startsWith(`${year}-`);
};

/**
 * Get week number of the year (IST)
 */
export const getWeekOfYear = (date: Date): number => {
  const ist = toIST(date);
  const start = new Date(ist.getFullYear(), 0, 1);
  const diff = ist.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil((diff / oneWeek) + 1);
};
