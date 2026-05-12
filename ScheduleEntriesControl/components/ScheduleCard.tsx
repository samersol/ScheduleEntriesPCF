import * as React from 'react';
import { ScheduleEntry } from '../types';
import { formatTime } from '../utils/dateUtils';

interface ScheduleCardProps {
    entry: ScheduleEntry;
}

function formatDuration(minutes: number): string {
    return minutes % 60 === 0
        ? `${minutes / 60} h`
        : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ entry }) => {
    const startTime = formatTime(entry.dateFrom);
    const endTime = formatTime(entry.dateTo);
    const durationStr = formatDuration(entry.duration);
    const timeStr = `${startTime}\u2013${endTime} \u00B7 ${durationStr}`;

    const customerLine = entry.customerName || entry.costCenterName;
    const addressLine = entry.fullAddress;
    const costCenterMeta = entry.costCenterNumber ? `KST: ${entry.costCenterNumber}` : '';
    const noteLine = entry.note?.trim();

    return (
        <div
            style={{
                background: '#F0F4E4',
                borderLeft: '3px solid #6B8E23',
                borderRadius: '0 4px 4px 0',
                padding: '8px 10px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
            }}
        >
            <div
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4D7C0F',
                    lineHeight: 1.3,
                }}
            >
                {customerLine}
            </div>

            {addressLine && (
                <div
                    style={{
                        fontSize: '12px',
                        color: '#4B5563',
                        lineHeight: 1.3,
                    }}
                >
                    {addressLine}
                </div>
            )}

            {costCenterMeta && (
                <div
                    style={{
                        fontSize: '11px',
                        color: '#6B7280',
                        fontWeight: 600,
                        lineHeight: 1.3,
                    }}
                >
                    {costCenterMeta}
                </div>
            )}

            {noteLine && (
                <div
                    style={{
                        fontSize: '11px',
                        color: '#6B7280',
                        lineHeight: 1.35,
                        fontStyle: 'italic',
                    }}
                >
                    {noteLine}
                </div>
            )}

            <div
                style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    marginTop: '2px',
                    lineHeight: 1.3,
                }}
            >
                {timeStr}
            </div>
        </div>
    );
};
