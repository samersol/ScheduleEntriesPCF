import * as React from 'react';
import { useState } from 'react';

interface HoverTooltipProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({ trigger, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <span
            style={{ position: 'relative', cursor: 'default', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {trigger}
            {visible && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 6px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        color: '#1F2937',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        zIndex: 10,
                        pointerEvents: 'none',
                    }}
                >
                    {children}
                </span>
            )}
        </span>
    );
};
