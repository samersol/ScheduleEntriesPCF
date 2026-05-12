import { Employee, ScheduleEntry, AbsenceEntry, AbsenceType } from '../types';

function getVal(
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
    name: string
): string {
    try {
        return record.getFormattedValue(name) ?? '';
    } catch {
        return '';
    }
}

function isPlaceholder(value: string): boolean {
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || trimmed === 'val';
}

/**
 * Parses a date value from any of the formats Dataverse may send:
 * - "06.04.2026 06:00"       German datetime
 * - "06.04.2026"              German date
 * - "4/6/2026 6:00 AM"        US datetime with meridiem
 * - "2026-04-06T06:00:00"     ISO datetime
 * - "2026-04-06T06:00:00Z"    ISO with Z
 * - "2026-04-06"              ISO date only
 */
export function parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'val') return null;

    // ISO: "2026-04-06T06:00:00" / "2026-04-06T06:00:00Z" / "2026-04-06"
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d;
    }

    // German datetime "06.04.2026 06:00"
    const deDateTime = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})/.exec(trimmed);
    if (deDateTime) {
        return new Date(
            Number(deDateTime[3]),
            Number(deDateTime[2]) - 1,
            Number(deDateTime[1]),
            Number(deDateTime[4]),
            Number(deDateTime[5]),
        );
    }

    // German date "06.04.2026"
    const deDate = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
    if (deDate) {
        return new Date(Number(deDate[3]), Number(deDate[2]) - 1, Number(deDate[1]));
    }

    // US datetime "4/6/2026 6:00 AM"
    const usDateTime = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(trimmed);
    if (usDateTime) {
        let hours = Number(usDateTime[4]);
        const meridiem = usDateTime[6]?.toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return new Date(
            Number(usDateTime[3]),
            Number(usDateTime[1]) - 1,
            Number(usDateTime[2]),
            hours,
            Number(usDateTime[5]),
        );
    }

    // US date "4/6/2026"
    const usDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (usDate) {
        return new Date(Number(usDate[3]), Number(usDate[1]) - 1, Number(usDate[2]));
    }

    // Last resort
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Parses a number from German "7,5" or US/ISO "7.5" or numeric.
 */
export function parseNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    const trimmed = value.trim();
    if (!trimmed || trimmed === '\u2013' || trimmed.toLowerCase() === 'val') return 0;
    const normalized = trimmed.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(normalized);
    if (isNaN(n)) {
        const fallback = parseFloat(trimmed);
        return isNaN(fallback) ? 0 : fallback;
    }
    return n;
}

/**
 * Normalizes a Dataverse GUID: strips braces, lowercases.
 */
export function parseGuid(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/[{}]/g, '').trim().toLowerCase();
}

/**
 * Reads a date column as a native Date, bypassing locale-formatted strings.
 * Falls back to parseDate on the formatted string if getValue isn't available.
 */
function getDateValue(
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
    name: string,
): Date | null {
    try {
        const raw = record.getValue?.(name);
        if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
        if (typeof raw === 'number' && !isNaN(raw)) return new Date(raw);
        if (typeof raw === 'string' && raw) {
            const parsed = parseDate(raw);
            if (parsed) return parsed;
        }
    } catch { /* fall through */ }
    try {
        const formatted = record.getFormattedValue(name);
        if (formatted) return parseDate(formatted);
    } catch { /* ignore */ }
    return null;
}

/**
 * Reads a number column as a native number, bypassing locale decimal separators.
 * Falls back to parseNumber on the formatted string if getValue isn't available.
 */
function getNumberValue(
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
    name: string,
): number {
    try {
        const raw = record.getValue?.(name);
        if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
        if (typeof raw === 'string' && raw) return parseNumber(raw);
    } catch { /* fall through */ }
    try {
        return parseNumber(record.getFormattedValue(name));
    } catch { /* ignore */ }
    return 0;
}

// Column alias constants — match ControlManifest.Input.xml property-set names
// (which are the Dataverse logical column names for direct binding without AddColumns).
const COL = {
    // Employee
    employeeId:          'pur_fxemployeeid',
    employeeName:        'pur_fxfullname',
    employeeNumber:      'pur_stremployeenumber',
    employeeNote:        'pur_fxemployeenote',
    customers:           'pur_strcustomers',
    weeklyHours:         'pur_dblweeklyworkhours',
    trainingExpiryDate:  'pur_dtetrainingexpirydate',
    dateOfBirth:         'pur_dtedateofbirth',
    // Schedule
    scheduleEntryId:     'pur_fxscheduleentry',
    scheduleEmployeeId:  'pur_fxscheduleemployeeid',
    customerName:        'pur_fxcustomername',
    fullAddress:         'pur_fxfulladdress',
    costCenterNumber:    'pur_fxcostcenternumber',
    costCenterName:      'pur_fxcostcentername',
    dateFrom:            'pur_dtedatefrom',
    dateTo:              'pur_dtedateto',
    duration:            'pur_fxduration',
    note:                'pur_strnote',
    // Absence
    absenceEntryId:      'pur_fxabsenceentryid',
    absenceEmployeeId:   'pur_fxabsenceemployeeid',
    absenceType:         'pur_fxabsencetype',
    dateStart:           'pur_dtedatestart',
    dateEnd:             'pur_dtedateend',
} as const;

export function parseEmployees(dataset: ComponentFramework.PropertyTypes.DataSet): Employee[] {
    if (!dataset || dataset.loading || !dataset.sortedRecordIds || dataset.sortedRecordIds.length === 0) {
        return [];
    }
    const result: Employee[] = [];
    for (const id of dataset.sortedRecordIds) {
        const r = dataset.records[id];
        const rawEmployeeId = getVal(r, COL.employeeId);
        const employeeName = getVal(r, COL.employeeName);

        if (isPlaceholder(rawEmployeeId) || isPlaceholder(employeeName)) {
            continue;
        }

        const weeklyHours = getNumberValue(r, COL.weeklyHours);

        result.push({
            employeeId: parseGuid(rawEmployeeId),
            employeeName,
            employeeNumber: getVal(r, COL.employeeNumber),
            note: getVal(r, COL.employeeNote),
            customers: getVal(r, COL.customers),
            weeklyHours,
            trainingExpiryDate: getDateValue(r, COL.trainingExpiryDate),
            dateOfBirth: getDateValue(r, COL.dateOfBirth),
        });
    }
    return result;
}

export function parseScheduleEntries(dataset: ComponentFramework.PropertyTypes.DataSet): ScheduleEntry[] {
    if (!dataset || dataset.loading || !dataset.sortedRecordIds || dataset.sortedRecordIds.length === 0) {
        return [];
    }
    const result: ScheduleEntry[] = [];
    for (const id of dataset.sortedRecordIds) {
        const r = dataset.records[id];
        const rawEmployeeId = getVal(r, COL.scheduleEmployeeId);
        if (isPlaceholder(rawEmployeeId)) continue;

        const dateFrom = getDateValue(r, COL.dateFrom);
        if (!dateFrom) continue;

        result.push({
            scheduleEntryId: parseGuid(getVal(r, COL.scheduleEntryId)) || id,
            employeeId: parseGuid(rawEmployeeId),
            customerName: getVal(r, COL.customerName),
            fullAddress: getVal(r, COL.fullAddress),
            costCenterNumber: getVal(r, COL.costCenterNumber),
            costCenterName: getVal(r, COL.costCenterName),
            dateFrom,
            dateTo: getDateValue(r, COL.dateTo),
            duration: getNumberValue(r, COL.duration),
            note: getVal(r, COL.note),
        });
    }
    return result;
}

export function parseAbsences(dataset: ComponentFramework.PropertyTypes.DataSet): AbsenceEntry[] {
    if (!dataset || dataset.loading || !dataset.sortedRecordIds || dataset.sortedRecordIds.length === 0) {
        return [];
    }
    const result: AbsenceEntry[] = [];
    for (const id of dataset.sortedRecordIds) {
        const r = dataset.records[id];
        const rawEmployeeId = getVal(r, COL.absenceEmployeeId);
        if (isPlaceholder(rawEmployeeId)) continue;

        const dateStart = getDateValue(r, COL.dateStart);
        if (!dateStart) continue;

        result.push({
            absenceEntryId: parseGuid(getVal(r, COL.absenceEntryId)) || id,
            employeeId: parseGuid(rawEmployeeId),
            absenceType: (getVal(r, COL.absenceType) as AbsenceType) || 'SO',
            dateStart,
            dateEnd: getDateValue(r, COL.dateEnd),
        });
    }
    return result;
}
