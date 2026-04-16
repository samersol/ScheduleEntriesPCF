export interface Holiday {
    date: string;
    name: string;
}

export const SACHSEN_HOLIDAYS: Holiday[] = [
    // 2025
    { date: '2025-01-01', name: 'Neujahr' },
    { date: '2025-04-18', name: 'Karfreitag' },
    { date: '2025-04-21', name: 'Ostermontag' },
    { date: '2025-05-01', name: 'Tag der Arbeit' },
    { date: '2025-05-29', name: 'Christi Himmelfahrt' },
    { date: '2025-06-09', name: 'Pfingstmontag' },
    { date: '2025-10-03', name: 'Tag der Dt. Einheit' },
    { date: '2025-10-31', name: 'Reformationstag' },
    { date: '2025-11-19', name: 'Bu\u00DF- und Bettag' },
    { date: '2025-12-25', name: '1. Weihnachtsfeiertag' },
    { date: '2025-12-26', name: '2. Weihnachtsfeiertag' },
    // 2026
    { date: '2026-01-01', name: 'Neujahr' },
    { date: '2026-04-03', name: 'Karfreitag' },
    { date: '2026-04-06', name: 'Ostermontag' },
    { date: '2026-05-01', name: 'Tag der Arbeit' },
    { date: '2026-05-14', name: 'Christi Himmelfahrt' },
    { date: '2026-05-25', name: 'Pfingstmontag' },
    { date: '2026-10-03', name: 'Tag der Dt. Einheit' },
    { date: '2026-10-31', name: 'Reformationstag' },
    { date: '2026-11-18', name: 'Bu\u00DF- und Bettag' },
    { date: '2026-12-25', name: '1. Weihnachtsfeiertag' },
    { date: '2026-12-26', name: '2. Weihnachtsfeiertag' },
    // 2027
    { date: '2027-01-01', name: 'Neujahr' },
    { date: '2027-03-26', name: 'Karfreitag' },
    { date: '2027-03-29', name: 'Ostermontag' },
    { date: '2027-05-01', name: 'Tag der Arbeit' },
    { date: '2027-05-06', name: 'Christi Himmelfahrt' },
    { date: '2027-05-17', name: 'Pfingstmontag' },
    { date: '2027-10-03', name: 'Tag der Dt. Einheit' },
    { date: '2027-10-31', name: 'Reformationstag' },
    { date: '2027-11-17', name: 'Bu\u00DF- und Bettag' },
    { date: '2027-12-25', name: '1. Weihnachtsfeiertag' },
    { date: '2027-12-26', name: '2. Weihnachtsfeiertag' },
];

const holidaySet = new Set(SACHSEN_HOLIDAYS.map(h => h.date));
const holidayMap = new Map(SACHSEN_HOLIDAYS.map(h => [h.date, h.name]));

export function isHoliday(dateStr: string): boolean {
    return holidaySet.has(dateStr);
}

export function getHolidayName(dateStr: string): string | null {
    return holidayMap.get(dateStr) ?? null;
}
