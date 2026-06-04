import * as React from 'react';
import { Employee, ScheduleEntry, AbsenceEntry } from '../types';
import { DayCell } from './DayCell';
import { formatBirthdayDE, calculateAge, isoStringToDate, addDays, calculateNetWorkMinutes, filterEntriesForDay, filterAbsencesForDay, formatMinutesToHours } from '../utils/dateUtils';
import { BirthdayCakeIcon } from './icons';
import { HoverTooltip } from './HoverTooltip';

interface EmployeeRowProps {
    employee: Employee;
    weekStartDate: string;
    weekDays: string[];
    allEntries: ScheduleEntry[];
    allAbsences: AbsenceEntry[];
    copyModeActive: boolean;
    onEmpty: (employeeId: string, date: string) => void;
    onFilled: (employeeId: string, date: string) => void;
    onCopy: (employeeId: string, date: string, entry: ScheduleEntry) => void;
    onPaste: (employeeId: string, date: string) => void;
}

function isTrainingValid(trainingExpiryDate: Date | null): boolean {
    if (!trainingExpiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(
        trainingExpiryDate.getFullYear(),
        trainingExpiryDate.getMonth(),
        trainingExpiryDate.getDate()
    );
    return expiry.getTime() >= today.getTime();
}

function isBirthdayThisWeek(dateOfBirth: Date | null, weekStartISO: string): boolean {
    if (!dateOfBirth || !weekStartISO) return false;

    const monday = isoStringToDate(weekStartISO);
    const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

    const month = dateOfBirth.getMonth();
    const day = dateOfBirth.getDate();

    const birthdayThisYear = new Date(monday.getFullYear(), month, day);
    if (birthdayThisYear >= monday && birthdayThisYear <= friday) return true;
    const birthdayNextYear = new Date(monday.getFullYear() + 1, month, day);
    return birthdayNextYear >= monday && birthdayNextYear <= friday;
}




export const EmployeeRow: React.FC<EmployeeRowProps> = ({
    employee,
    weekStartDate,
    weekDays,
    allEntries,
    allAbsences,
    copyModeActive,
    onEmpty,
    onFilled,
    onCopy,
    onPaste,
}) => {
    // Week range as Dates (Mon 00:00 to Sat 00:00 exclusive)
    const weekStart = isoStringToDate(weekStartDate);
    const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);

    const entriesForEmployee = allEntries.filter((e) => e.employeeId === employee.employeeId);
    const absencesForEmployee = allAbsences.filter((a) => a.employeeId === employee.employeeId);

    // Ist: sum of durations in the visible week
    const actualNum = entriesForEmployee
        .filter((e) => {
            if (!e.dateFrom) return false;
            return e.dateFrom >= weekStart && e.dateFrom < weekEnd;
        })
        .reduce((sum, e) => sum + (e.duration || 0), 0);

    // Soll: dynamic with holidays + absences deducted
    const targetNum = calculateNetWorkMinutes(employee, absencesForEmployee, weekStartDate, addDays(weekStartDate, 6));

    const sollColor = actualNum !== targetNum ? '#DC2626' : '#6B7280';

    const showBirthday = isBirthdayThisWeek(employee.dateOfBirth, weekStartDate);
    const birthdayText = employee.dateOfBirth
        ? `\uD83C\uDF82 Geburtstag am ${formatBirthdayDE(employee.dateOfBirth)} (${calculateAge(employee.dateOfBirth)} Jahre)`
        : '';

    const getEntriesForDay = (dateStr: string) => filterEntriesForDay(entriesForEmployee, dateStr);
    const getAbsencesForDay = (dateStr: string) => filterAbsencesForDay(absencesForEmployee, dateStr);

    const employeeNote = employee.note?.trim();
    const customersLine = employee.customers?.trim();

    return (
        <React.Fragment>
            {/* Employee info cell */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    borderRight: '1px solid #E5E7EB',
                    boxSizing: 'border-box',
                    minHeight: '70px',
                }}
            >
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isTrainingValid(employee.trainingExpiryDate) ? '#22C55E' : '#EF4444',
                        flexShrink: 0,
                    }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                            {employee.employeeName}
                        </span>
                        {showBirthday && (
                            <HoverTooltip trigger={<BirthdayCakeIcon />}>
                                {birthdayText}
                            </HoverTooltip>
                        )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{employee.employeeNumber}</span>
                    {employeeNote && (
                        <span
                            style={{
                                fontSize: '11px',
                                color: '#6B7280',
                                lineHeight: 1.35,
                                fontStyle: 'italic',
                                marginTop: '2px',
                            }}
                        >
                            {employeeNote}
                        </span>
                    )}
                    {customersLine && (
                        <span
                            style={{
                                fontSize: '11px',
                                color: '#6B7280',
                                lineHeight: 1.35,
                                marginTop: '2px',
                            }}
                        >
                            {customersLine}
                        </span>
                    )}
                </div>
            </div>

            {/* Day cells Mon-Fri */}
            {weekDays.map((date) => (
                <DayCell
                    key={date}
                    employeeId={employee.employeeId}
                    date={date}
                    entries={getEntriesForDay(date)}
                    absences={getAbsencesForDay(date)}
                    copyModeActive={copyModeActive}
                    hasRightBorder={true}
                    onEmpty={onEmpty}
                    onFilled={onFilled}
                    onCopy={onCopy}
                    onPaste={onPaste}
                />
            ))}

            {/* Ist cell */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    borderRight: '1px solid #E5E7EB',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1F2937',
                    minHeight: '70px',
                    boxSizing: 'border-box',
                }}
            >
                {formatMinutesToHours(actualNum)}
            </div>

            {/* Soll cell */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: sollColor,
                    minHeight: '70px',
                    boxSizing: 'border-box',
                }}
            >
                {formatMinutesToHours(targetNum)}
            </div>
        </React.Fragment>
    );
};
