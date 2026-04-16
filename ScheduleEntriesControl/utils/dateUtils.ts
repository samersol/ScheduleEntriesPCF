/**
 * Normalizes a date string to ISO format YYYY-MM-DD.
 * Accepts both "YYYY-MM-DD" and German "DD.MM.YYYY" formats.
 * Used for the weekStartDate input property.
 */
export function normalizeDateToISO(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
    if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
        const parts = dateStr.split('.');
        return `${parts[2].substring(0, 4)}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

export function addDays(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day + days);
    return formatDateISO(date);
}

export function formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Converts an ISO date string "YYYY-MM-DD" to a local-midnight Date. */
export function isoStringToDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** Returns YYYY-MM-DD for a Date, or "" if null. */
export function dateToISO(date: Date | null): string {
    if (!date) return '';
    return formatDateISO(date);
}

export function formatDateDE(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.`;
}

export function getWeekDays(weekStartDate: string): string[] {
    return [0, 1, 2, 3, 4].map(i => addDays(weekStartDate, i));
}

export function getWeekDayAbbr(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return days[date.getDay()];
}

/**
 * Checks if an ISO date "YYYY-MM-DD" falls within a Date range (inclusive).
 * Start/end Dates are normalized to midnight for day-level comparison.
 */
export function isDateInRange(
    dateStr: string,
    start: Date | null,
    end: Date | null,
): boolean {
    if (!start || !end) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d).getTime();
    const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return target >= startMid && target <= endMid;
}

/** Returns "HH:MM" from a Date, or "" if null. */
export function formatTime(date: Date | null): string {
    if (!date) return '';
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

export function calculateAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const mDiff = today.getMonth() - dateOfBirth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }
    return age;
}

export function formatBirthdayDE(dateOfBirth: Date | null): string {
    if (!dateOfBirth) return '';
    const d = String(dateOfBirth.getDate()).padStart(2, '0');
    const m = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.`;
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

export function getDayOfWeek(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day).getDay();
}

export function isWeekend(year: number, month: number, day: number): boolean {
    const dow = getDayOfWeek(year, month, day);
    return dow === 0 || dow === 6;
}

export function getMonthDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getDayAbbrFromDate(year: number, month: number, day: number): string {
    const dow = getDayOfWeek(year, month, day);
    const abbrs = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return abbrs[dow];
}
