import { useState } from 'react';
import { CopyState } from '../types';

interface UseCopyPasteReturn {
    copyState: CopyState;
    startCopy: (employeeId: string, employeeName: string, date: string, recordIds: string[]) => void;
    cancelCopy: () => void;
}

const initialCopyState: CopyState = {
    active: false,
    employeeId: '',
    employeeName: '',
    date: '',
    recordIds: [],
};

export function useCopyPaste(): UseCopyPasteReturn {
    const [copyState, setCopyState] = useState<CopyState>(initialCopyState);

    const startCopy = (employeeId: string, employeeName: string, date: string, recordIds: string[]) => {
        setCopyState({ active: true, employeeId, employeeName, date, recordIds });
    };

    const cancelCopy = () => {
        setCopyState(initialCopyState);
    };

    return { copyState, startCopy, cancelCopy };
}
