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
import * as moment from 'moment';

import {SystemHelper} from '../../../../shared/misc/helpers/system.helper';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {DayMonthFullYearDateFormatEnum} from '../../enums/date-format.enum';
import {Task} from '../../models/tasks/task';

@Component({
    selector: 'ss-task-overview-card',
    templateUrl: './task-overview-card.component.html',
    styleUrls: ['./task-overview-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskOverviewCardComponent {

    @Input()
    public actions: MenuItemsList[];

    @Input()
    public isCritical: boolean;

    @Input()
    public task: Task;

    @Output()
    public actionClicked = new EventEmitter<MenuItem>();

    @Output()
    public itemClicked = new EventEmitter<Task>();

    public useCssHasFallback = !this._systemHelper.isCssHasSupported();

    public get startDate(): string {
        return this._getFormattedDate(this.task.schedule.start);
    }

    public get endDate(): string {
        return this._getFormattedDate(this.task.schedule.end);
    }

    public get timeScope(): string {
        return `${this.startDate} - ${this.endDate}`;
    }

    constructor(
        private _systemHelper: SystemHelper,
        private _translateService: TranslateService,
    ) {
    }

    public handleDropdownItemClicked(item: MenuItem): void {
        this.actionClicked.emit(item);
    }

    public handleContentClicked(): void {
        this.itemClicked.emit(this.task);
    }

    private _getFormattedDate(date: string): string {
        const currentLang: string = this._translateService.defaultLang;
        const dateFormat: string = DayMonthFullYearDateFormatEnum[currentLang];

        return moment(date).locale(currentLang).format(dateFormat);
    }
}
