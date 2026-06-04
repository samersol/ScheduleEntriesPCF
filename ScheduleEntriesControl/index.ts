import { IInputs, IOutputs } from './generated/ManifestTypes';
import { App, IAppProps } from './components/App';
import * as React from 'react';

const MAX_PAGE_SIZE = 5000;

export class SchedulePlannerV7 implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private outputValues: IOutputs = {};
    private pageSizeSet = false;

    constructor() {
        // Empty
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const employeeDS = context.parameters.employeeDataSet;
        const scheduleDS = context.parameters.scheduleDataSet;
        const absenceDS = context.parameters.absenceDataSet;

        // Set page size to max once, so each page fetch pulls as many records as possible.
        if (!this.pageSizeSet) {
            try {
                employeeDS.paging?.setPageSize?.(MAX_PAGE_SIZE);
                scheduleDS.paging?.setPageSize?.(MAX_PAGE_SIZE);
                absenceDS.paging?.setPageSize?.(MAX_PAGE_SIZE);
            } catch {
                // ignore — not all hosts support setPageSize
            }
            this.pageSizeSet = true;
        }

        // Wait while any dataset is still loading.
        if (employeeDS.loading || scheduleDS.loading || absenceDS.loading) {
            return this.renderLoading();
        }

        // Drain pagination on each dataset before rendering. One extra page per updateView cycle.
        if (employeeDS.paging?.hasNextPage) {
            employeeDS.paging.loadNextPage();
            return this.renderLoading();
        }
        if (scheduleDS.paging?.hasNextPage) {
            scheduleDS.paging.loadNextPage();
            return this.renderLoading();
        }
        if (absenceDS.paging?.hasNextPage) {
            absenceDS.paging.loadNextPage();
            return this.renderLoading();
        }

        const props: IAppProps = {
            context,
            onOutputChanged: (outputs: IOutputs) => {
                this.outputValues = { ...this.outputValues, ...outputs };
                this.notifyOutputChanged();
            },
            width: context.mode.allocatedWidth,
            height: context.mode.allocatedHeight,
        };
        return React.createElement(App, props);
    }

    private renderLoading(): React.ReactElement {
        return React.createElement(
            'div',
            {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    fontSize: '13px',
                    color: '#6B7280',
                },
            },
            'Daten werden geladen\u2026'
        );
    }

    public getOutputs(): IOutputs {
        return this.outputValues;
    }

    public destroy(): void {
        // Cleanup
    }
}
