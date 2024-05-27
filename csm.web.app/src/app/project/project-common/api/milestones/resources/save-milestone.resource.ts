/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {RowId} from '../../../../../shared/ui/calendar/calendar/calendar.component';
import {MilestoneFormData} from '../../../containers/milestone-capture/milestone-capture.component';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';
import {Milestone} from '../../../models/milestones/milestone';

export class SaveMilestoneResource {
    public projectId: string;
    public name: string;
    public type: MilestoneTypeEnum;
    public date: string;
    public header: boolean;
    public craftId?: string;
    public workAreaId?: string;
    public description?: string;
    public position?: number;

    constructor(projectId: string,
                name: string,
                type: MilestoneTypeEnum,
                date: string,
                header: boolean,
                craftId?: string,
                workAreaId?: string,
                description?: string,
                position?: number) {
        this.projectId = projectId;
        this.name = name;
        this.type = type;
        this.date = date;
        this.header = header;
        this.craftId = craftId;
        this.workAreaId = workAreaId;
        this.description = description;
        this.position = position;
    }

    static fromMilestone(milestone: Milestone): SaveMilestoneResource {
        const {
            project,
            name,
            type,
            date,
            header,
            craft,
            workArea,
            description,
            position,
        } = milestone;
        const craftId = craft ? craft.id : null;
        const workAreaId = workArea ? workArea.id : null;

        return new SaveMilestoneResource(project.id, name, type, SaveMilestoneResource.getDate(date), header, craftId, workAreaId, description, position);
    }

    static fromFormData(projectId: string, milestoneFormDate: MilestoneFormData): SaveMilestoneResource {
        const {title, date, type: {marker: {type}, craftId}, description, location} = milestoneFormDate;
        const {header, workAreaId} = SaveMilestoneResource.getLocation(location);

        return new SaveMilestoneResource(projectId, title, type, SaveMilestoneResource.getDate(date), header, craftId || null, workAreaId, description);
    }

    public withDate(date: moment.Moment): SaveMilestoneResource {
        this.date = SaveMilestoneResource.getDate(date);

        return this;
    }

    public withLocation(location: RowId): SaveMilestoneResource {
        const {header, workAreaId} = SaveMilestoneResource.getLocation(location);

        this.header = header;
        this.workAreaId = workAreaId;

        return this;
    }

    public withPosition(position: number): SaveMilestoneResource {
        this.position = position;

        return this;
    }

    protected static getLocation(location: RowId): {header: boolean, workAreaId: string} {
        return {
            header: location === 'header',
            workAreaId: location === 'header' || location === 'no-row' ? null : location,
        };
    }

    protected static getDate(date: moment.Moment): string {
        return date.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
    }
}
