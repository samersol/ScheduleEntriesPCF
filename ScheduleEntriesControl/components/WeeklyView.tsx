import * as React from 'react';
import { useState } from 'react';
import { Employee, ScheduleEntry, AbsenceEntry, CopyState } from '../types';
import { getWeekDays, getWeekDayAbbr, formatDateDE } from '../utils/dateUtils';
import { isHoliday, getHolidayName } from '../utils/holidays';
import { CopyBanner } from './CopyBanner';
import { EmployeeRow } from './EmployeeRow';

interface WeeklyViewProps {
    weekStartDate: string;
    employees: Employee[];
    scheduleEntries: ScheduleEntry[];
    absences: AbsenceEntry[];
    copyState: CopyState;
    onCancelCopy: () => void;
    onEmpty: (employeeId: string, date: string) => void;
    onFilled: (employeeId: string, date: string) => void;
    onCopy: (employeeId: string, date: string, entries: ScheduleEntry[]) => void;
    onPaste: (employeeId: string, date: string) => void;
    pasteWarning: string;
    width?: number;
    height?: number;
}

const HolidayTooltip: React.FC<{ date: string }> = ({ date }) => {
    const [visible, setVisible] = useState(false);
    const name = getHolidayName(date);
    if (!name) return null;

    return (
        <span
            style={{ position: 'relative', cursor: 'default' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <span style={{ fontSize: '11px', color: '#0369A1' }}>{name}</span>
            {visible && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 4px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        color: '#1F2937',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        zIndex: 10,
                        pointerEvents: 'none',
                    }}
                >
                    {name}
                </span>
            )}
        </span>
    );
};

export const WeeklyView: React.FC<WeeklyViewProps> = ({
    weekStartDate,
    employees,
    scheduleEntries,
    absences,
    copyState,
    onCancelCopy,
    onEmpty,
    onFilled,
    onCopy,
    onPaste,
    pasteWarning,
    width,
    height,
}) => {
    const weekDays = getWeekDays(weekStartDate);

    const headerCellBase: React.CSSProperties = {
        padding: '14px 12px',
        textAlign: 'center',
        borderBottom: '1px solid #E5E7EB',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 3,
    };

    return (
        <div
            style={{
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                fontSize: '14px',
                color: '#1F2937',
                width: width ? `${width}px` : '100%',
                height: height ? `${height}px` : undefined,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {copyState.active && <CopyBanner copyState={copyState} onCancel={onCancelCopy} />}

            {pasteWarning && (
                <div
                    style={{
                        position: 'absolute',
                        top: copyState.active ? '56px' : '16px',
                        right: '16px',
                        maxWidth: '420px',
                        background: '#FEF2F2',
                        color: '#991B1B',
                        border: '1px solid #FECACA',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        zIndex: 20,
                        fontSize: '13px',
                        lineHeight: 1.4,
                    }}
                >
                    {pasteWarning}
                </div>
            )}

            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    overflow: 'auto',
                    flex: 1,
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '180px repeat(5, 1fr) 70px 70px',
                        width: '100%',
                        minWidth: '900px',
                    }}
                >
                    {/* Header row — sticky */}
                    <React.Fragment>
                        <div
                            style={{
                                ...headerCellBase,
                                textAlign: 'left',
                                paddingLeft: '16px',
                                fontWeight: 600,
                                color: '#6B7280',
                                fontSize: '13px',
                                background: '#FFFFFF',
                            }}
                        >
                            Mitarbeiter
                        </div>

                        {weekDays.map((date) => {
                            const holiday = isHoliday(date);
                            return (
                                <div
                                    key={date}
                                    style={{
                                        ...headerCellBase,
                                        background: holiday ? '#E0F2FE' : '#FFFFFF',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                                        {getWeekDayAbbr(date)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                                        {formatDateDE(date)}
                                    </div>
                                    {holiday && <HolidayTooltip date={date} />}
                                </div>
                            );
                        })}

                        <div
                            style={{
                                ...headerCellBase,
                                fontWeight: 600,
                                fontSize: '13px',
                                color: '#6B7280',
                                background: '#FFFFFF',
                            }}
                        >
                            Ist
                        </div>
                        <div
                            style={{
                                ...headerCellBase,
                                fontWeight: 600,
                                fontSize: '13px',
                                color: '#6B7280',
                                background: '#FFFFFF',
                            }}
                        >
                            Soll
                        </div>
                    </React.Fragment>

                    {/* Employee rows */}
                    {employees.length === 0 ? (
                        <div
                            style={{
                                gridColumn: '1 / -1',
                                padding: '40px',
                                textAlign: 'center',
                                color: '#9CA3AF',
                                fontSize: '14px',
                            }}
                        >
                            Keine Mitarbeiter gefunden.
                        </div>
                    ) : (
                        employees.map((employee) => (
                            <EmployeeRow
                                key={employee.employeeId}
                                employee={employee}
                                weekStartDate={weekStartDate}
                                weekDays={weekDays}
                                allEntries={scheduleEntries}
                                allAbsences={absences}
                                copyModeActive={copyState.active}
                                onEmpty={onEmpty}
                                onFilled={onFilled}
                                onCopy={onCopy}
                                onPaste={onPaste}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
