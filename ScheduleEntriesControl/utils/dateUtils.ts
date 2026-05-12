import { Employee, ScheduleEntry, AbsenceEntry } from '../types';
import { isHoliday } from './holidays';

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

export function formatDateDE(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.`;
}

export function getWeekDays(weekStartDate: string): string[] {
    return [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(weekStartDate, i));
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
export function isDateInRange(dateStr: string, start: Date | null, end: Date | null): boolean {
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

/** Minutes → "X h" or "X.XX h" for summary cells */
export function formatMinutesToHours(minutes: number): string {
    return minutes % 60 === 0 ? `${minutes / 60}\u00A0h` : `${(minutes / 60).toFixed(2)}\u00A0h`;
}

/** Minutes → bare numeric string (no suffix) for sign-prefixed or unit-less cells */
export function formatMinutesToHoursNumeric(minutes: number): string {
    return minutes % 60 === 0 ? `${minutes / 60}` : (minutes / 60).toFixed(2);
}

export function filterEntriesForDay(entries: ScheduleEntry[], dateStr: string): ScheduleEntry[] {
    return entries
        .filter((e) => e.dateFrom !== null && formatDateISO(e.dateFrom) === dateStr)
        .sort((a, b) => (a.dateFrom?.getTime() ?? 0) - (b.dateFrom?.getTime() ?? 0));
}

export function filterAbsencesForDay(absences: AbsenceEntry[], dateStr: string): AbsenceEntry[] {
    return absences.filter((a) => isDateInRange(dateStr, a.dateStart, a.dateEnd));
}

export function calculateNetWorkMinutes(
    employee: Employee,
    employeeAbsences: AbsenceEntry[],
    startDateStr: string,
    endDateStr: string
): number {
    const dailyMinutes = ((employee.weeklyHours || 0) / 5) * 60;
    const start = isoStringToDate(startDateStr);
    const end = isoStringToDate(endDateStr);
    let workDays = 0;
    let absenceDays = 0;
    const current = new Date(start);
    while (current <= end) {
        const dateStr = formatDateISO(current);
        const dow = current.getDay();
        if (dow !== 0 && dow !== 6 && !isHoliday(dateStr)) {
            workDays++;
            if (employeeAbsences.some((a) => isDateInRange(dateStr, a.dateStart, a.dateEnd))) absenceDays++;
        }
        current.setDate(current.getDate() + 1);
    }
    return (workDays - absenceDays) * dailyMinutes;
}

export function getCurrentMonday(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

export function isValidISODate(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return !isNaN(d.getTime());
}

function toMinutes(date: Date | null): number | null {
    if (!date) return null;
    return date.getHours() * 60 + date.getMinutes();
}

export function hasPasteOverlap(
    scheduleEntries: ScheduleEntry[],
    copiedRecordIds: string[],
    targetEmployeeId: string,
    targetDate: string
): boolean {
    if (copiedRecordIds.length === 0) return false;

    const copiedEntries = scheduleEntries.filter((entry) => copiedRecordIds.includes(entry.scheduleEntryId));
    const targetEntries = scheduleEntries.filter(
        (entry) =>
            entry.employeeId === targetEmployeeId && entry.dateFrom && formatDateISO(entry.dateFrom) === targetDate
    );

    return copiedEntries.some((copiedEntry) => {
        const copiedStart = toMinutes(copiedEntry.dateFrom);
        const copiedEnd = toMinutes(copiedEntry.dateTo);

        if (copiedStart === null || copiedEnd === null) return false;

        return targetEntries.some((targetEntry) => {
            const targetStart = toMinutes(targetEntry.dateFrom);
            const targetEnd = toMinutes(targetEntry.dateTo);

            if (targetStart === null || targetEnd === null) return false;

            return copiedStart < targetEnd && targetStart < copiedEnd;
        });
    });
}
