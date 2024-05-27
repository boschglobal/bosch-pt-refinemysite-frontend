/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';

import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {
    TableSettings,
    TableSettingsHeader
} from '../../../../../shared/ui/table/table.component';
import {ProjectTaskContentModel} from '../../containers/tasks-content/project-tasks-content.model';

@Component({
    selector: 'ss-project-tasks-table',
    templateUrl: './project-tasks-table.component.html',
    styleUrls: ['./project-tasks-table.component.scss'],
})
export class ProjectTasksTableComponent implements OnInit {
    /**
     * @description Property injected to table component with tasks
     * @type {Object[]}
     */
    @Input()
    public tasks: ProjectTaskContentModel[];

    /**
     * @description Property injected to table component with the current sort data
     * @type {SorterData} sorterData
     */
    @Input()
    set sort(sorterData: SorterData) {
        this._sort = sorterData;
        this._setSettings();
    }

    /**
     * @description Property injected to table component to allow selection of tasks
     * @type {boolean}
     */
    @Input()
    public isSelecting: boolean;

    /**
     * @description Property injected to table component with type of task that is allowed to select
     * @type {boolean}
     */
    @Input()
    public isRowSelectable: Function = (): boolean => true;

    /**
     * @description Triggered when selection changes
     * @type {EventEmitter<string[]>}
     */
    @Output()
    public onSelectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * @description Property that holds selected rows
     * @type {Array}
     */
    @Input()
    public selectedRows: string[] = [];

    /**
     * @description Event triggered to parent component with sorting information
     * @type {EventEmitter<SorterData>}
     */
    @Output()
    public onSort: EventEmitter<SorterData> = new EventEmitter<SorterData>();

    /**
     * @description Triggered when task is clicked
     * @type {EventEmitter<ProjectTaskContentModel>}
     */
    @Output()
    public onClickTask: EventEmitter<ProjectTaskContentModel> = new EventEmitter<ProjectTaskContentModel>();

    /**
     * @description Property injected to table component as headers
     */
    public settings: TableSettings;

    ngOnInit() {
        this._setSettings();
    }

    /**
     * @description Event triggered when table columns are sorted
     * @description Check the direction and dispatch the action with the handled payload
     * @param {SorterData} sorterData
     */
    public onSortTable(sorterData: SorterData): void {
        this.onSort.emit(sorterData);
    }

    /**
     * @description Called when table row is clicked
     * @param {ProjectTaskContentModel} task
     */
    public onClickRowTable(task: ProjectTaskContentModel): void {
        this.onClickTask.emit(task);
    }

    private _sort: SorterData;

    private _setSettings(): void {
        this.settings = {
            headers: this._getHeaders(),
            messages: {
                empty: 'Generic_NoRecordsFound',
                loading: 'Generic_LoadingRecords',
            },
            allowMultipleSort: false,
            allowNeutralSort: false,
        };
    }

    private _getHeaders(): TableSettingsHeader[] {
        const defaultHeaders = [
            {
                title: 'Task_Title_Label',
                field: 'name',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 20,
            },
            {
                title: 'Generic_WorkingArea',
                field: 'workArea',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: 'Generic_Start',
                field: 'start',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 10,
            },
            {
                title: 'Generic_Due',
                field: 'end',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 10,
            },
            {
                title: 'Generic_Craft',
                field: 'craft',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 12,
            },
            {
                title: 'Generic_Company',
                field: 'company',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 17,
            },
            {
                title: 'Generic_Status',
                field: 'status',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 4,
            },
            {
                title: 'Generic_News',
                field: 'news',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 12,
            },
        ];

        return defaultHeaders.map(header => {
            if (typeof this._sort !== 'undefined' && this._sort.field === header.field) {
                header.sortable.direction = this._sort.direction;
            }
            return header;
        });
    }
}
