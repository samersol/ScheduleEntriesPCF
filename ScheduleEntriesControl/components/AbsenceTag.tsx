import * as React from 'react';
import { AbsenceType } from '../types';
import { getAbsenceConfig } from '../utils/absenceColors';

interface AbsenceTagProps {
    type: AbsenceType;
    short?: boolean;
}

export const AbsenceTag: React.FC<AbsenceTagProps> = ({ type, short = false }) => {
    const config = getAbsenceConfig(type);
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                background: config.bg,
                color: config.text,
                whiteSpace: 'nowrap',
            }}
        >
            {short ? config.shortLabel : config.label}
        </span>
    );
};
