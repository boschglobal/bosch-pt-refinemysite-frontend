/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {WeekDaysEnum} from '../../../../../shared/misc/enums/weekDays.enum';

export class WorkDaysResource extends AbstractAuditableResource {
    public allowWorkOnNonWorkingDays = false;
    public holidays: WorkDaysHoliday[] = [];
    public startOfWeek: WeekDaysEnum = null;
    public workingDays: WeekDaysEnum[] = [];
}

export interface WorkDaysHoliday {
    name: string;
    date: string;
}
