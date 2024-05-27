/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {SystemHelper} from '../../../../shared/misc/helpers/system.helper';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {DayMonthFullYearDateFormatEnum} from '../../enums/date-format.enum';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneMarkerModel} from '../milestone-marker/milestone-marker.component';

@Component({
    selector: 'ss-milestone-overview-card',
    templateUrl: './milestone-overview-card.component.html',
    styleUrls: ['./milestone-overview-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneOverviewCardComponent {

    @Input()
    public actions: MenuItemsList[];

    @Input()
    public isCritical: boolean;

    @Input()
    public set milestone(milestone: Milestone) {
        this._milestone = milestone;
        this.milestoneMarker = {
            type: milestone?.type,
            color: milestone?.craft?.color,
        };
    }

    public get milestone(): Milestone {
        return this._milestone;
    }

    @Output()
    public itemClicked = new EventEmitter<Milestone>();

    @Output()
    public actionClicked = new EventEmitter<MenuItem>();

    public get formattedDate(): string {
        const currentLang = this._translateService.defaultLang;
        const dateFormat = DayMonthFullYearDateFormatEnum[currentLang];

        return this.milestone.date.locale(currentLang).format(dateFormat);
    }

    public useCssHasFallback: boolean;

    public milestoneMarker: MilestoneMarkerModel;

    private _milestone: Milestone;

    constructor(
        private _systemHelper: SystemHelper,
        private _translateService: TranslateService,
    ) {
        this.useCssHasFallback = !this._systemHelper.isCssHasSupported();
    }

    public handleDropdownItemClicked(item: MenuItem): void {
        this.actionClicked.emit(item);
    }

    public handleContentClicked(): void {
        this.itemClicked.emit(this._milestone);
    }
}
