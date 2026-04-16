import * as React from 'react';
import { ScheduleEntry } from '../types';
import { formatTime } from '../utils/dateUtils';

interface ScheduleCardProps {
    entry: ScheduleEntry;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ entry }) => {
    const startTime = formatTime(entry.dateFrom);
    const endTime = formatTime(entry.dateTo);
    const durationStr = entry.duration % 1 === 0 ? `${entry.duration}` : entry.duration.toFixed(1);
    const timeStr = `${startTime}\u2013${endTime} \u00B7 ${durationStr}h`;

    return (
        <div
            style={{
                background: '#F0F4E4',
                borderLeft: '3px solid #6B8E23',
                borderRadius: '0 4px 4px 0',
                padding: '8px 10px',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4D7C0F',
                }}
            >
                {entry.costCenterName}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                {timeStr}
            </div>
        </div>
    );
};
