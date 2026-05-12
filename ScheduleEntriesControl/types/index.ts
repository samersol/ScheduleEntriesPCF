export interface Employee {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    note: string;
    customers: string;
    weeklyHours: number;
    trainingExpiryDate: Date | null;
    dateOfBirth: Date | null;
}

export interface ScheduleEntry {
    scheduleEntryId: string;
    employeeId: string;
    customerName: string;
    fullAddress: string;
    costCenterNumber: string;
    costCenterName: string;
    dateFrom: Date | null;
    dateTo: Date | null;
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

