import * as React from 'react';
import { Employee, ScheduleEntry, AbsenceEntry } from '../types';
import {
    getDaysInMonth,
    isWeekend,
    getMonthDateStr,
    getDayAbbrFromDate,
    calculateNetWorkMinutes,
    filterEntriesForDay,
    filterAbsencesForDay,
    formatMinutesToHours,
    formatMinutesToHoursNumeric,
} from '../utils/dateUtils';
import { getAbsenceConfig } from '../utils/absenceColors';
import { isHoliday, getHolidayName } from '../utils/holidays';

interface MonthlyViewProps {
    weekStartDate: string;
    employees: Employee[];
    scheduleEntries: ScheduleEntry[];
    absences: AbsenceEntry[];
    width?: number;
    height?: number;
}

function calculateMonthlyActualHours(
    employeeId: string,
    scheduleEntries: ScheduleEntry[],
    year: number,
    month: number
): number {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1); // exclusive

    return scheduleEntries
        .filter((entry) => {
            if (entry.employeeId !== employeeId) return false;
            if (!entry.dateFrom) return false;
            return entry.dateFrom >= monthStart && entry.dateFrom < monthEnd;
        })
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);
}


export const MonthlyView: React.FC<MonthlyViewProps> = ({
    weekStartDate,
    employees,
    scheduleEntries,
    absences,
    width,
    height,
}) => {
    const parts = weekStartDate.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const daysInMonth = getDaysInMonth(year, month);

    const headerCellStyle: React.CSSProperties = {
        padding: '8px 4px',
        textAlign: 'center',
        borderBottom: '1px solid #E5E7EB',
        borderRight: '1px solid #E5E7EB',
        background: '#FFFFFF',
        boxSizing: 'border-box',
        fontSize: '12px',
    };

    const stickyLeft = (left: number): React.CSSProperties => ({
        position: 'sticky',
        left,
        zIndex: 2,
        background: '#FFFFFF',
    });

    const summaryCellBase: React.CSSProperties = {
        padding: '8px 6px',
        textAlign: 'right',
        fontWeight: 600,
        fontSize: '13px',
        borderBottom: '1px solid #E5E7EB',
        borderRight: '1px solid #E5E7EB',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    };

    // Calculate totals for Gesamt row
    let totalActual = 0;
    let totalTarget = 0;
    const empData = employees.map((emp) => {
        const empAbsences = absences.filter((a) => a.employeeId === emp.employeeId);
        const empEntries = scheduleEntries.filter((e) => e.employeeId === emp.employeeId);
        const actual = calculateMonthlyActualHours(emp.employeeId, scheduleEntries, year, month);
        const target = calculateNetWorkMinutes(emp, empAbsences, getMonthDateStr(year, month, 1), getMonthDateStr(year, month, daysInMonth));
        totalActual += actual;
        totalTarget += target;
        return { emp, actual, target, empAbsences, empEntries };
    });
    const totalDiff = totalActual - totalTarget;

    const monthNames = [
        'Januar',
        'Februar',
        'M\u00E4rz',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
    ];

    return (
        <div
            style={{
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                fontSize: '12px',
                color: '#1F2937',
                width: width ? `${width}px` : '100%',
                height: height ? `${height}px` : undefined,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#1F2937',
                        flexShrink: 0,
                    }}
                >
                    {monthNames[month - 1]} {year}
                </div>

                <div style={{ overflow: 'auto', flex: 1 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `140px 70px 70px 70px repeat(${daysInMonth}, minmax(36px, 1fr))`,
                            width: 'max-content',
                            minWidth: '100%',
                        }}
                    >
                        {/* ===== Header row ===== */}
                        <div
                            style={{
                                ...headerCellStyle,
                                ...stickyLeft(0),
                                textAlign: 'left',
                                paddingLeft: '12px',
                                fontWeight: 600,
                                color: '#6B7280',
                                zIndex: 4,
                            }}
                        >
                            Mitarbeiter
                        </div>
                        <div
                            style={{
                                ...headerCellStyle,
                                ...stickyLeft(140),
                                fontWeight: 600,
                                color: '#6B7280',
                                zIndex: 4,
                            }}
                        >
                            Soll
                        </div>
                        <div
                            style={{
                                ...headerCellStyle,
                                ...stickyLeft(210),
                                fontWeight: 600,
                                color: '#6B7280',
                                zIndex: 4,
                            }}
                        >
                            Ist
                        </div>
                        <div
                            style={{
                                ...headerCellStyle,
                                ...stickyLeft(280),
                                fontWeight: 600,
                                color: '#6B7280',
                                zIndex: 4,
                            }}
                        >
                            Diff
                        </div>

                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const abbr = getDayAbbrFromDate(year, month, day);
                            const weekend = isWeekend(year, month, day);
                            const dateStr = getMonthDateStr(year, month, day);
                            const holiday = isHoliday(dateStr);
                            const holidayName = getHolidayName(dateStr);

                            let bg = '#FFFFFF';
                            if (holiday) bg = '#E0F2FE';
                            else if (weekend) bg = '#F5F5F3';

                            return (
                                <div
                                    key={day}
                                    title={holidayName ?? undefined}
                                    style={{
                                        ...headerCellStyle,
                                        background: bg,
                                        minWidth: '36px',
                                    }}
                                >
                                    <div style={{ fontWeight: 500, color: '#6B7280', fontSize: '11px' }}>{abbr}</div>
                                    <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '12px' }}>{day}</div>
                                </div>
                            );
                        })}

                        {/* ===== Employee rows ===== */}
                        {empData.map(({ emp, actual, target, empAbsences, empEntries }) => {
                            const diff = actual - target;
                            const diffColor = diff < 0 ? '#DC2626' : diff > 0 ? '#16A34A' : '#6B7280';

                            return (
                                <React.Fragment key={emp.employeeId}>
                                    {/* Employee name */}
                                    <div
                                        style={{
                                            ...stickyLeft(0),
                                            padding: '8px 12px',
                                            borderBottom: '1px solid #E5E7EB',
                                            borderRight: '1px solid #E5E7EB',
                                            boxSizing: 'border-box',
                                            minHeight: '48px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, fontSize: '12px', color: '#1F2937' }}>
                                            {emp.employeeName}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{emp.employeeNumber}</span>
                                    </div>

                                    {/* Soll */}
                                    <div style={{ ...summaryCellBase, ...stickyLeft(140) }}>
                                        {target > 0 ? formatMinutesToHours(target) : '\u2013'}
                                    </div>

                                    {/* Ist */}
                                    <div style={{ ...summaryCellBase, ...stickyLeft(210), fontWeight: 600 }}>
                                        {actual > 0 ? formatMinutesToHours(actual) : '\u2013'}
                                    </div>

                                    {/* Diff */}
                                    <div style={{ ...summaryCellBase, ...stickyLeft(280), color: diffColor }}>
                                        {diff === 0 ? '\u2013' : `${diff > 0 ? '+' : ''}${formatMinutesToHoursNumeric(diff)}\u00A0h`}
                                    </div>

                                    {/* Day cells */}
                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        const dateStr = getMonthDateStr(year, month, day);
                                        const weekend = isWeekend(year, month, day);
                                        const holiday = isHoliday(dateStr);
                                        const dayEntries = filterEntriesForDay(empEntries, dateStr);
                                        const dayHours = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
                                        const dayAbsences = filterAbsencesForDay(empAbsences, dateStr);

                                        let bg = 'transparent';
                                        if (holiday) bg = '#E0F2FE';
                                        else if (weekend) bg = '#F5F5F3';

                                        return (
                                            <div
                                                key={day}
                                                style={{
                                                    padding: '4px',
                                                    borderBottom: '1px solid #E5E7EB',
                                                    borderRight: '1px solid #E5E7EB',
                                                    minHeight: '48px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '2px',
                                                    background: bg,
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                {dayHours > 0 && (
                                                    <span
                                                        style={{ fontSize: '12px', color: '#1F2937', fontWeight: 500 }}
                                                    >
                                                        {formatMinutesToHoursNumeric(dayHours)}
                                                    </span>
                                                )}
                                                {dayAbsences.map((abs) => {
                                                    const cfg = getAbsenceConfig(abs.absenceType);
                                                    return (
                                                        <span
                                                            key={abs.absenceEntryId}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '26px',
                                                                height: '22px',
                                                                borderRadius: '3px',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                                background: cfg.bg,
                                                                color: cfg.text,
                                                            }}
                                                        >
                                                            {cfg.shortLabel}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        {/* ===== Gesamt row ===== */}
                        {employees.length > 0 && (
                            <>
                                <div
                                    style={{
                                        ...stickyLeft(0),
                                        padding: '8px 12px',
                                        borderBottom: '1px solid #E5E7EB',
                                        borderRight: '1px solid #E5E7EB',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        background: '#FAFAFA',
                                        color: '#1F2937',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Gesamt
                                </div>
                                <div
                                    style={{
                                        ...summaryCellBase,
                                        ...stickyLeft(140),
                                        background: '#FAFAFA',
                                        fontWeight: 700,
                                    }}
                                >
                                    {totalTarget > 0 ? formatMinutesToHours(totalTarget) : '\u2013'}
                                </div>
                                <div
                                    style={{
                                        ...summaryCellBase,
                                        ...stickyLeft(210),
                                        background: '#FAFAFA',
                                        fontWeight: 700,
                                    }}
                                >
                                    {totalActual > 0 ? formatMinutesToHours(totalActual) : '\u2013'}
                                </div>
                                <div
                                    style={{
                                        ...summaryCellBase,
                                        ...stickyLeft(280),
                                        background: '#FAFAFA',
                                        fontWeight: 700,
                                        color: totalDiff < 0 ? '#DC2626' : totalDiff > 0 ? '#16A34A' : '#6B7280',
                                    }}
                                >
                                    {totalDiff === 0
                                        ? '\u2013'
                                        : `${totalDiff > 0 ? '+' : ''}${formatMinutesToHoursNumeric(totalDiff)} h`}
                                </div>
                                {Array.from({ length: daysInMonth }, (_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            borderBottom: '1px solid #E5E7EB',
                                            borderRight: '1px solid #E5E7EB',
                                            background: '#FAFAFA',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
