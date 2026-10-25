/**
 * Date formatting and calculation helpers for CampusFlow
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function getRelativeDueDateText(dateStr: string): { label: string; isUrgent: boolean; isOverdue: boolean } {
  if (!dateStr) return { label: 'No date', isUrgent: false, isOverdue: false };
  
  const todayStr = getTodayString();
  if (dateStr === todayStr) {
    return { label: 'Due Today', isUrgent: true, isOverdue: false };
  }

  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [dY, dM, dD] = dateStr.split('-').map(Number);

  const today = new Date(tY, tM - 1, tD);
  const due = new Date(dY, dM - 1, dD);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { label: 'Tomorrow', isUrgent: true, isOverdue: false };
  }
  if (diffDays === -1) {
    return { label: 'Yesterday', isUrgent: true, isOverdue: true };
  }
  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, isUrgent: true, isOverdue: true };
  }
  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, isUrgent: diffDays <= 2, isOverdue: false };
  }

  return { label: formatReadableDate(dateStr), isUrgent: false, isOverdue: false };
}

export function getLast7Days(): { dateStr: string; dayName: string; shortDate: string }[] {
  const result = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    result.push({ dateStr, dayName, shortDate });
  }

  return result;
}

export function formatMinutesToHours(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}
