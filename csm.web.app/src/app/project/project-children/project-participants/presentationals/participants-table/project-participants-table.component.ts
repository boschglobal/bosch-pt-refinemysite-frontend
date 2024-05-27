/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';

import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {
    TableSettings,
    TableSettingsHeader
} from '../../../../../shared/ui/table/table.component';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';
import {ProjectParticipantsListRowModel} from '../../containers/participants-content/project-participants-content.model';

@Component({
    selector: 'ss-project-participants-table',
    templateUrl: './project-participants-table.component.html',
    styleUrls: ['./project-participants-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectParticipantsTableComponent implements OnInit {
    /**
     * @description Property injected to table component as records
     * @type {ProjectParticipantsListRowModel[]}
     */
    @Input()
    public participants: ProjectParticipantsListRowModel[];

    /**
     * @description Property injected to table component with the current sort data
     * @type {SorterData}
     */
    @Input()
    set sort(sorterData: SorterData) {
        this._sort = sorterData;
        this._setSettings();
    }

    /**
     * @description Triggered when an action item is clicked
     * @type {EventEmitter<MenuItem<ProjectParticipantResource>>}
     */
    @Output()
    public actionClicked = new EventEmitter<MenuItem<ProjectParticipantResource>>();

    /**
     * @description Event triggered to parent component with sorting information
     * @type {EventEmitter<SorterData>}
     */
    @Output()
    public onSort: EventEmitter<SorterData> = new EventEmitter<SorterData>();

    /**
     * @description Triggered when row is clicked
     * @type {EventEmitter<ProjectParticipantsListRowModel>}
     */
    @Output()
    public onClickRow: EventEmitter<ProjectParticipantsListRowModel> = new EventEmitter<ProjectParticipantsListRowModel>();

    /**
     * @description Property injected to table component as headers
     */
    public settings: TableSettings;

    private _sort: SorterData;

    ngOnInit() {
        this._setSettings();
    }

    /**
     * @description Triggered when an action item is clicked
     * @type {MenuItem<ProjectParticipantResource>}
     */
    public handleDropdownItemClicked(item: MenuItem<ProjectParticipantResource>): void {
        this.actionClicked.emit(item);
    }

    /**
     * @description Event triggered when table columns are sorted
     * @description Check the direction and dispatch the action with the handled payload
     * @param sorterData
     */
    public onSortTable(sorterData: SorterData): void {
        this.onSort.emit(sorterData);
    }

    /**
     * @description Event triggered when table row is clicked
     * @param {ProjectParticipantsListRowModel} participant
     */
    public onClickRowTable(participant: ProjectParticipantsListRowModel): void {
        if (participant.status === ParticipantStatusEnum.ACTIVE) {
            this.onClickRow.emit(participant);
        }
    }

    public getUserStatus(userId: string): string {
        return this.participants.find(participant => participant.user.id === userId).status;
    }

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
                title: 'Generic_Name',
                field: 'user',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 18,
            },
            {
                title: 'Participant_Company_Label',
                field: 'company',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: 'Participant_Role_Label',
                field: 'role',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: 'Participant_Craft_Label',
                field: 'craft',
                sortable: {
                    enabled: false,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: 'Participant_Telephone_Title',
                field: 'telephone',
                sortable: {
                    enabled: false,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: 'Participant_Email_Label',
                field: 'email',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 15,
            },
            {
                title: '',
                field: 'options',
                sortable: {
                    enabled: false,
                    direction: SortDirectionEnum.neutral,
                },
                width: 7,
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
