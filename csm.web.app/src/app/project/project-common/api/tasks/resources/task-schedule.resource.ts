/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {DayCardResource} from '../../day-cards/resources/day-card.resource';

export class TaskScheduleResource extends AbstractAuditableResource {
    public start: string;
    public end: string;
    public task: ResourceReference;
    public slots: TaskScheduleSlotResource[];
    public _links: TaskScheduleLinks;
    public _embedded?: TaskScheduleEmbeddeds;
}

export class TaskScheduleLinks {
    public self: ResourceLink;
    public add?: ResourceLink;
    public move?: ResourceLink;
    public update?: ResourceLink;
    public 'delete'?: ResourceLink;
}

class TaskScheduleEmbeddeds {
    public dayCards: {
        items: DayCardResource[];
    };
}

export class TaskScheduleSlotResource {
    public dayCard: ResourceReference;
    public date: string;

    constructor(dayCard: ResourceReference, date: string) {
        this.dayCard = dayCard;
        this.date = date;
    }
}
