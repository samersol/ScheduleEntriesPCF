import * as React from 'react';
import { useState } from 'react';
import { ScheduleEntry, AbsenceEntry } from '../types';
import { ScheduleCard } from './ScheduleCard';
import { AbsenceTag } from './AbsenceTag';
import { isHoliday } from '../utils/holidays';

interface DayCellProps {
    employeeId: string;
    date: string;
    entries: ScheduleEntry[];
    absences: AbsenceEntry[];
    copyModeActive: boolean;
    hasRightBorder: boolean;
    onEmpty: (employeeId: string, date: string) => void;
    onFilled: (employeeId: string, date: string) => void;
    onCopy: (employeeId: string, date: string, entries: ScheduleEntry[]) => void;
    onPaste: (employeeId: string, date: string) => void;
}

const CopyIconSvg: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const PasteIconSvg: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
);

export const DayCell: React.FC<DayCellProps> = ({
    employeeId,
    date,
    entries,
    absences,
    copyModeActive,
    hasRightBorder,
    onEmpty,
    onFilled,
    onCopy,
    onPaste,
}) => {
    const [hovered, setHovered] = useState(false);

    const hasScheduleEntries = entries.length > 0;
    const holiday = isHoliday(date);

    const handleCellClick = () => {
        if (copyModeActive) {
            onPaste(employeeId, date);
        } else if (hasScheduleEntries) {
            onFilled(employeeId, date);
        } else {
            // Empty cell or absence-only cell -> click_empty
            onEmpty(employeeId, date);
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopy(employeeId, date, entries);
    };

    let cellBg = 'transparent';
    if (holiday) {
        cellBg = '#E0F2FE';
    } else if (hovered && !copyModeActive) {
        cellBg = hasScheduleEntries ? '#F5F7F0' : '#F9FAFB';
    }

    return (
        <div
            style={{
                position: 'relative',
                padding: '12px',
                borderBottom: '1px solid #E5E7EB',
                borderRight: hasRightBorder ? '1px solid #E5E7EB' : 'none',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: cellBg,
                cursor: 'pointer',
                transition: 'background 0.1s',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleCellClick}
        >
            {/* Copy button — top-right of CELL, only on hover when entries exist */}
            {hasScheduleEntries && hovered && !copyModeActive && (
                <button
                    style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        background: '#E5E7EB',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2,
                        padding: 0,
                    }}
                    onClick={handleCopy}
                >
                    <CopyIconSvg />
                </button>
            )}

            {/* Absence tags */}
            {absences.map(abs => (
                <AbsenceTag key={abs.absenceEntryId} type={abs.absenceType} />
            ))}

            {/* Schedule cards */}
            {entries.map(entry => (
                <ScheduleCard key={entry.scheduleEntryId} entry={entry} />
            ))}

            {/* Paste target — only on hover during copy mode, for cells without schedule entries */}
            {copyModeActive && !hasScheduleEntries && hovered && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        minHeight: '44px',
                        color: '#9CA3AF',
                    }}
                >
                    <PasteIconSvg />
                </div>
            )}
        </div>
    );
};
