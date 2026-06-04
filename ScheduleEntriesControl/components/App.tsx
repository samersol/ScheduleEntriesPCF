import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IInputs, IOutputs } from '../generated/ManifestTypes';
import { parseEmployees, parseScheduleEntries, parseAbsences } from '../hooks/useDatasets';
import { useCopyPaste } from '../hooks/useCopyPaste';
import { ScheduleEntry } from '../types';
import { normalizeDateToISO, getCurrentMonday, isValidISODate, hasPasteOverlap } from '../utils/dateUtils';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';

export interface IAppProps {
    context: ComponentFramework.Context<IInputs>;
    onOutputChanged: (outputs: IOutputs) => void;
    width?: number;
    height?: number;
}


export const App: React.FC<IAppProps> = ({ context, onOutputChanged, width, height }) => {
    const { copyState, startCopy, cancelCopy } = useCopyPaste();
    const [pasteWarning, setPasteWarning] = useState('');

    const lastValidDate = useRef<string>(getCurrentMonday());

    const rawInput = normalizeDateToISO(context.parameters.weekStartDate.raw ?? '');
    if (isValidISODate(rawInput)) {
        lastValidDate.current = rawInput;
    }
    const resolvedWeekStart = lastValidDate.current;

    const viewMode = context.parameters.viewMode.raw ?? 'week';

    const employees = parseEmployees(context.parameters.employeeDataSet);
    const scheduleEntries = parseScheduleEntries(context.parameters.scheduleDataSet);
    const absences = parseAbsences(context.parameters.absenceDataSet);

    const handleEmpty = (employeeId: string, date: string) => {
        onOutputChanged({
            selectedAction: 'click_empty',
            selectedEmployeeId: employeeId,
            selectedDate: date,
        });
    };

    const handleFilled = (employeeId: string, date: string) => {
        onOutputChanged({
            selectedAction: 'click_filled',
            selectedEmployeeId: employeeId,
            selectedDate: date,
        });
    };

    const handleCopy = (employeeId: string, date: string, entry: ScheduleEntry) => {
        const employee = employees.find(e => e.employeeId === employeeId);
        const employeeName = employee ? employee.employeeName : '';
        const recordIds = [entry.scheduleEntryId];

        startCopy(employeeId, employeeName, date, recordIds);

        onOutputChanged({
            selectedAction: 'copy',
            selectedEmployeeId: employeeId,
            selectedDate: date,
            copiedRecordIds: JSON.stringify(recordIds),
        });
    };

    useEffect(() => {
        if (!pasteWarning) return;

        const timeoutId = window.setTimeout(() => setPasteWarning(''), 3200);
        return () => window.clearTimeout(timeoutId);
    }, [pasteWarning]);

    const handlePaste = (targetEmployeeId: string, targetDate: string) => {
        const overlapDetected = hasPasteOverlap(
            scheduleEntries,
            copyState.recordIds,
            targetEmployeeId,
            targetDate,
        );

        if (overlapDetected) {
            setPasteWarning('⚠ Einfügen nicht möglich: Mindestens ein kopierter Dienst überlappt mit einem bestehenden Dienst.');
            onOutputChanged({
                selectedAction: 'cancel',
                selectedEmployeeId: targetEmployeeId,
                selectedDate: targetDate,
            });
            return;
        }

        onOutputChanged({
            selectedAction: 'paste',
            pasteTargetEmployeeId: targetEmployeeId,
            pasteTargetDate: targetDate,
            copiedRecordIds: JSON.stringify(copyState.recordIds),
        });
    };

    if (viewMode === 'month') {
        return (
            <MonthlyView
                weekStartDate={resolvedWeekStart}
                employees={employees}
                scheduleEntries={scheduleEntries}
                absences={absences}
                width={width}
                height={height}
            />
        );
    }

    return (
        <WeeklyView
            weekStartDate={resolvedWeekStart}
            employees={employees}
            scheduleEntries={scheduleEntries}
            absences={absences}
            copyState={copyState}
            onCancelCopy={cancelCopy}
            onEmpty={handleEmpty}
            onFilled={handleFilled}
            onCopy={handleCopy}
            onPaste={handlePaste}
            pasteWarning={pasteWarning}
            width={width}
            height={height}
        />
    );
};
