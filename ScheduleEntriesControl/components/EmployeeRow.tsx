import * as React from 'react';
import { useState } from 'react';
import { Employee, ScheduleEntry, AbsenceEntry } from '../types';
import { DayCell } from './DayCell';
import { isDateInRange, formatBirthdayDE, calculateAge, formatDateISO, isoStringToDate } from '../utils/dateUtils';
import { isHoliday } from '../utils/holidays';

interface EmployeeRowProps {
    employee: Employee;
    weekStartDate: string;
    weekDays: string[];
    allEntries: ScheduleEntry[];
    allAbsences: AbsenceEntry[];
    copyModeActive: boolean;
    onEmpty: (employeeId: string, date: string) => void;
    onFilled: (employeeId: string, date: string) => void;
    onCopy: (employeeId: string, date: string, entries: ScheduleEntry[]) => void;
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
    const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);

    const month = dateOfBirth.getMonth();
    const day = dateOfBirth.getDate();

    const birthdayThisYear = new Date(monday.getFullYear(), month, day);
    if (birthdayThisYear >= monday && birthdayThisYear <= friday) return true;
    const birthdayNextYear = new Date(monday.getFullYear() + 1, month, day);
    return birthdayNextYear >= monday && birthdayNextYear <= friday;
}

function calculateWeeklyTargetHours(
    employee: Employee,
    employeeAbsences: AbsenceEntry[],
    weekStartISO: string
): number {
    const dailyHours = (employee.weeklyHours || 0) / 5;
    const monday = isoStringToDate(weekStartISO);

    let workDays = 0;
    let absenceDays = 0;

    for (let i = 0; i < 5; i++) {
        const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const dateStr = formatDateISO(date);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue;
        if (isHoliday(dateStr)) continue;
        workDays++;

        const isAbsent = employeeAbsences.some((a) => isDateInRange(dateStr, a.dateStart, a.dateEnd));
        if (isAbsent) absenceDays++;
    }

    return (workDays - absenceDays) * dailyHours;
}

const BirthdayCakeIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EC4899"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginLeft: '4px', verticalAlign: 'middle', flexShrink: 0 }}
    >
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" />
        <path d="M7 8v3" />
        <path d="M12 8v3" />
        <path d="M17 8v3" />
        <path d="M7 4h.01" />
        <path d="M12 4h.01" />
        <path d="M17 4h.01" />
    </svg>
);

function formatHours(n: number): string {
    return n % 1 === 0 ? `${n} h` : `${Math.floor(n)} h ${(n % 1) * 60} min`;
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
    const [tooltipVisible, setTooltipVisible] = useState(false);

    // Week range as Dates (Mon 00:00 to Sat 00:00 exclusive)
    const weekStart = isoStringToDate(weekStartDate);
    const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5);

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
    const targetNum = calculateWeeklyTargetHours(employee, absencesForEmployee, weekStartDate);

    const sollColor = actualNum !== targetNum ? '#DC2626' : '#6B7280';

    const showBirthday = isBirthdayThisWeek(employee.dateOfBirth, weekStartDate);
    const birthdayText = employee.dateOfBirth
        ? `\uD83C\uDF82 Geburtstag am ${formatBirthdayDE(employee.dateOfBirth)} (${calculateAge(employee.dateOfBirth)} Jahre)`
        : '';

    const getEntriesForDay = (dateStr: string): ScheduleEntry[] =>
        entriesForEmployee
            .filter((e) => e.dateFrom && formatDateISO(e.dateFrom) === dateStr)
            .sort((a, b) => (a.dateFrom?.getTime() ?? 0) - (b.dateFrom?.getTime() ?? 0));

    const getAbsencesForDay = (dateStr: string): AbsenceEntry[] =>
        absencesForEmployee.filter((a) => isDateInRange(dateStr, a.dateStart, a.dateEnd));

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
                            <span
                                style={{
                                    position: 'relative',
                                    cursor: 'default',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                }}
                                onMouseEnter={() => setTooltipVisible(true)}
                                onMouseLeave={() => setTooltipVisible(false)}
                            >
                                <BirthdayCakeIcon />
                                {tooltipVisible && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            bottom: 'calc(100% + 8px)',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '13px',
                                            fontWeight: 400,
                                            color: '#1F2937',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            zIndex: 10,
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {birthdayText}
                                    </span>
                                )}
                            </span>
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
                {formatHours(actualNum)}
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
                {formatHours(targetNum)}
            </div>
        </React.Fragment>
    );
};
