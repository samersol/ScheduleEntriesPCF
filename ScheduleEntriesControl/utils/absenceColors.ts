import { AbsenceType } from '../types';

export interface AbsenceConfig {
    bg: string;
    text: string;
    label: string;
    shortLabel: string;
}

export const absenceColors: Record<AbsenceType, AbsenceConfig> = {
    U:  { bg: '#FEF3C7', text: '#92400E', label: 'Urlaub',         shortLabel: 'U'  },
    K:  { bg: '#FEE2E2', text: '#991B1B', label: 'Krank',          shortLabel: 'K'  },
    UF: { bg: '#FCE4EC', text: '#880E4F', label: 'Unentschuldigt', shortLabel: 'UF' },
    KK: { bg: '#FFF3E0', text: '#E65100', label: 'Kind krank',     shortLabel: 'KK' },
    SU: { bg: '#E0F2FE', text: '#0C4A6E', label: 'Sonderurlaub',   shortLabel: 'SU' },
    SO: { bg: '#F3F4F6', text: '#374151', label: 'Sonstiges',      shortLabel: 'SO' },
};

export function getAbsenceConfig(type: string): AbsenceConfig {
    return absenceColors[type as AbsenceType] ?? absenceColors.SO;
}
