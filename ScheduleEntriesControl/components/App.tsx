import * as React from 'react';
import { useRef } from 'react';
import { IInputs, IOutputs } from '../generated/ManifestTypes';
import { parseEmployees, parseScheduleEntries, parseAbsences } from '../hooks/useDatasets';
import { useCopyPaste } from '../hooks/useCopyPaste';
import { ScheduleEntry } from '../types';
import { normalizeDateToISO } from '../utils/dateUtils';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';

export interface IAppProps {
    context: ComponentFramework.Context<IInputs>;
    onOutputChanged: (outputs: IOutputs) => void;
    width?: number;
    height?: number;
}

function getCurrentMonday(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function isValidISODate(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return !isNaN(d.getTime());
}

export const App: React.FC<IAppProps> = ({ context, onOutputChanged, width, height }) => {
    const { copyState, startCopy, cancelCopy } = useCopyPaste();

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

    const handleCopy = (employeeId: string, date: string, entries: ScheduleEntry[]) => {
        const employee = employees.find(e => e.employeeId === employeeId);
        const employeeName = employee ? employee.employeeName : '';
        const recordIds = entries.map(e => e.scheduleEntryId);

        startCopy(employeeId, employeeName, date, recordIds);

        onOutputChanged({
            selectedAction: 'copy',
            selectedEmployeeId: employeeId,
            selectedDate: date,
            copiedRecordIds: JSON.stringify(recordIds),
        });
    };

    const handlePaste = (targetEmployeeId: string, targetDate: string) => {
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
            width={width}
            height={height}
        />
    );
};
