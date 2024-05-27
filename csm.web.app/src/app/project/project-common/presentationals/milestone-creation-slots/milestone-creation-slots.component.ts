/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {UUID} from '../../../../shared/misc/identification/uuid';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {SaveMilestoneResource} from '../../api/milestones/resources/save-milestone.resource';
import {MilestoneTypeOption} from '../../containers/milestone-type-options/milestone-type-options.component';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {MilestoneMarkerModel} from '../milestone-marker/milestone-marker.component';

export const DEFAULT_MILESTONE_MARKER_MODEL: MilestoneMarkerModel = {
    color: COLORS.light_grey_50,
    type: MilestoneTypeEnum.Craft,
};
const NUMBER_OF_DAYS_PER_WEEK = 7;

@Component({
    selector: 'ss-milestone-creation-slots',
    templateUrl: './milestone-creation-slots.component.html',
    styleUrls: ['./milestone-creation-slots.component.scss']
})
export class MilestoneCreationSlotsComponent implements OnInit, OnDestroy {

    @Input()
    public header = false;

    @Input()
    public week: moment.Moment;

    @Input()
    public workAreaId: string = null;

    @Output()
    public addMilestone: EventEmitter<SaveMilestoneResource> = new EventEmitter<SaveMilestoneResource>();

    public days: boolean[] = new Array(NUMBER_OF_DAYS_PER_WEEK).fill(null);

    public marker: MilestoneMarkerModel = DEFAULT_MILESTONE_MARKER_MODEL;

    public selectedDayIndex: number;

    private _baseFlyoutId = `milestone-type-options-${UUID.v4()}`;

    private _projectId: string;

    private _selectedTypeOption: MilestoneTypeOption;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _flyoutService: FlyoutService,
                private _projectSliceService: ProjectSliceService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public trackByFn(index: number): number {
        return index;
    }

    public getFlyoutId(selectedIndex: number, mode: 'title' | 'type'): string {
        return `${this._baseFlyoutId}-${selectedIndex}-${mode}`;
    }

    public handleSelectIndex(index: number): void {
        this._reset();
        this._flyoutService.close(this.getFlyoutId(index, 'title'));
        this._flyoutService.open(this.getFlyoutId(index, 'type'));
        this.selectedDayIndex = index;
    }

    public handleSelectOption(option: MilestoneTypeOption): void {
        this.marker = option.marker;
        this._selectedTypeOption = option;

        this._flyoutService.close(this.getFlyoutId(this.selectedDayIndex, 'type'));
        this._flyoutService.open(this.getFlyoutId(this.selectedDayIndex, 'title'));
    }

    public handleAddMilestone(title: string): void {
        const {craftId, marker} = this._selectedTypeOption;
        const date = this.week.clone().add(this.selectedDayIndex, 'd');
        const saveMilestone = new SaveMilestoneResource(
            this._projectId,
            title,
            marker.type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            this.header,
            craftId,
            this.workAreaId,
        );

        this._flyoutService.close(this.getFlyoutId(this.selectedDayIndex, 'title'));
        this.addMilestone.emit(saveMilestone);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents.pipe(
                filter(flyoutId => this._shouldResetMilestoneCreation(flyoutId))
            ).subscribe(() => this._reset())
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(projectId => this._setProjectId(projectId))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _reset(): void {
        this.selectedDayIndex = null;
        this._selectedTypeOption = null;
        this.marker = DEFAULT_MILESTONE_MARKER_MODEL;
    }

    private _setProjectId(projectId: string): void {
        this._projectId = projectId;
    }

    private _shouldResetMilestoneCreation(flyoutId: string): boolean {
        return (this.getFlyoutId(this.selectedDayIndex, 'type') === flyoutId && !this._selectedTypeOption)
            || (this.getFlyoutId(this.selectedDayIndex, 'title') === flyoutId);
    }
}
