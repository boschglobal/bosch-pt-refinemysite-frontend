/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

import {UUID} from '../../../../shared/misc/identification/uuid';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {FlyoutOpenTriggerEnum} from '../../../../shared/ui/flyout/directive/flyout.directive';
import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {WorkDaysHoliday} from '../../api/work-days/resources/work-days.resource';

export const DAYCARD_SLOT_LOCKED = 'padlock';
export const DAYCARD_SLOT_LOCKED_HOLIDAY = 'padlock-holiday';

@Component({
    selector: 'ss-day-card-locked',
    templateUrl: './day-card-locked.component.html',
    styleUrls: ['./day-card-locked.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DayCardLockedComponent {
    @Input()
    public set holiday(value: WorkDaysHoliday) {
        this.icon.name = value ? DAYCARD_SLOT_LOCKED_HOLIDAY : DAYCARD_SLOT_LOCKED;
        this.holidayName = value?.name;
    }

    public holidayName: string | undefined;

    public icon: IconModel = {
        name: DAYCARD_SLOT_LOCKED,
        color: COLORS.dark_grey,
    };

    public slotID = UUID.v4();

    public tooltipFlyoutTrigger = FlyoutOpenTriggerEnum.Hover;
}
