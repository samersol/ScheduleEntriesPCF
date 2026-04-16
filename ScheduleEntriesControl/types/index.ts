export interface Employee {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    weeklyHours: number;
    actualHours: number;
    targetHours: number;
    trainingExpiryDate: Date | null;
    hasBirthdayThisWeek: boolean;
    dateOfBirth: Date | null;
}

export interface ScheduleEntry {
    scheduleEntryId: string;
    employeeId: string;
    costCenterName: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    pause: number;
    duration: number;
    note: string;
}

export interface AbsenceEntry {
    absenceEntryId: string;
    employeeId: string;
    absenceType: AbsenceType;
    dateStart: Date | null;
    dateEnd: Date | null;
}

export type AbsenceType = 'U' | 'K' | 'UF' | 'KK' | 'SU' | 'SO';

export interface CopyState {
    active: boolean;
    employeeId: string;
    employeeName: string;
    date: string;
    recordIds: string[];
}

export interface OutputValues {
    selectedAction?: string;
    selectedEmployeeId?: string;
    selectedDate?: string;
    copiedRecordIds?: string;
    pasteTargetEmployeeId?: string;
    pasteTargetDate?: string;
}
