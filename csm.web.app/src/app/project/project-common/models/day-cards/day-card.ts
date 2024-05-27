/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {uniqWith} from 'lodash';
import * as moment from 'moment/moment';

import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {RfvKey} from '../../api/rfvs/resources/rfv.resource';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {WorkingDaysHelper} from '../../helpers/working-days.helper';
import {TaskSchedule} from '../task-schedules/task-schedule';

export interface DayCardPermissions {
    canUpdate: boolean;
    canDelete: boolean;
    canCancel: boolean;
    canComplete: boolean;
    canApprove: boolean;
    canReset: boolean;
}

export class DayCard extends AbstractAuditableResource {
    public title: string;
    public manpower: number;
    public notes?: string;
    public status: DayCardStatusEnum;
    public reason?: NamedEnumReference<RfvKey>;
    public task: ResourceReference;
    public date: string;
    public permissions: DayCardPermissions;

    public static fromDayCardResource(dayCardResource: DayCardResource, date: string): DayCard {
        if (dayCardResource == null) {
            return dayCardResource as any;
        }

        const {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            title,
            manpower,
            notes,
            status,
            reason,
            task,
        } = dayCardResource;

        const dayCard = new DayCard();

        dayCard.id = id;
        dayCard.version = version;
        dayCard.createdBy = createdBy;
        dayCard.createdDate = createdDate;
        dayCard.lastModifiedBy = lastModifiedBy;
        dayCard.lastModifiedDate = lastModifiedDate;
        dayCard.title = title;
        dayCard.manpower = manpower;
        dayCard.notes = notes;
        dayCard.status = status;
        dayCard.reason = reason;
        dayCard.task = task;
        dayCard.date = date;
        dayCard.permissions = this._mapLinksToPermissions(dayCardResource);

        return dayCard;
    }

    public static getLockedSlotsDates(dayCards: DayCard[],
                                      schedule: TaskSchedule,
                                      workDays: WorkDaysResource,
                                      excludeDays: moment.Moment[] = []): moment.Moment[] {
        const existingDayCardDates: moment.Moment[] = dayCards.map(daycard => moment(daycard.date));
        const nonWorkingDays: moment.Moment[] = this._getNonWorkingDays(schedule, workDays);
        const uniqDates = uniqWith([...nonWorkingDays, ...existingDayCardDates], (a, b) => a.isSame(b, 'd'));
        const filteredLockedSlotsDates = uniqDates.filter(date => !excludeDays.find(excludedDay => excludedDay.isSame(date, 'd')));

        return filteredLockedSlotsDates;
    }

    private static _getNonWorkingDays({start, end}: TaskSchedule,
                                      {workingDays, holidays, allowWorkOnNonWorkingDays}: WorkDaysResource): moment.Moment[] {
        return allowWorkOnNonWorkingDays
            ? []
            : new Array(moment(end).diff(moment(start), 'd') + 1)
                .fill(moment(start))
                .map((day: moment.Moment, i) => day.clone().add(i, 'd'))
                .filter(day => !WorkingDaysHelper.isDayAWorkingDay(day, workingDays) || WorkingDaysHelper.isDayAHoliday(day, holidays));
    }

    private static _mapLinksToPermissions(dayCardResource: DayCardResource): DayCardPermissions {
        const links = dayCardResource._links;
        return {
            canUpdate: 'update' in links,
            canDelete: 'delete' in links,
            canCancel: 'cancel' in links,
            canComplete: 'complete' in links,
            canApprove: 'approve' in links,
            canReset: 'reset' in links,
        };
    }
}
