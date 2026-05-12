import * as React from 'react';
import { CopyState } from '../types';
import { CopyIconSvg } from './icons';

interface CopyBannerProps {
    copyState: CopyState;
    onCancel: () => void;
}

export const CopyBanner: React.FC<CopyBannerProps> = ({ copyState, onCancel }) => {
    const count = copyState.recordIds.length;
    const plural = count === 1 ? 'Dienst' : 'Dienste';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '13px',
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CopyIconSvg stroke="#92400E" size={16} />
                <span style={{ color: '#1F2937' }}>
                    Einsatz kopiert von{' '}
                    <strong>{copyState.employeeName}</strong>
                    {' '}({count} {plural}) &rarr; Zelle anklicken zum Einf&uuml;gen
                </span>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    userSelect: 'none',
                }}
                onClick={onCancel}
            >
                &#x2715;&nbsp;Abbrechen
            </div>
        </div>
    );
};
