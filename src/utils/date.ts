import dayjs from 'dayjs';

export const formatDate = (date: string | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

export const daysBetween = (start: string | Date | dayjs.Dayjs, end: string | Date | dayjs.Dayjs): number => {
  return dayjs(end).diff(dayjs(start), 'day');
};

export const today = (format: string = 'YYYY-MM-DD'): string => {
  return dayjs().format(format);
};
