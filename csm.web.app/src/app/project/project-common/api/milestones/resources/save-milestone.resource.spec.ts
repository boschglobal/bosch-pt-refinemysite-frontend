/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import * as moment from 'moment';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_CRAFT_FORM_DATA,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_HEADER_FORM_DATA,
    MOCK_MILESTONE_WORKAREA,
    MOCK_MILESTONE_WORKAREA_FORM_DATA
} from '../../../../../../test/mocks/milestones';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {RowId} from '../../../../../shared/ui/calendar/calendar/calendar.component';
import {MilestoneFormData} from '../../../containers/milestone-capture/milestone-capture.component';
import {SaveMilestoneResource} from './save-milestone.resource';

describe('Save Milestone Resource', () => {

    it('should return a header SaveMilestoneResource when calling fromMilestone', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const {project, name, type, date, header, description, position} = milestone;
        const saveMilestoneResource = new SaveMilestoneResource(
            project.id,
            name,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            header,
            null,
            null,
            description,
            position,
        );

        expect(SaveMilestoneResource.fromMilestone(milestone)).toEqual(saveMilestoneResource);
    });

    it('should return a craft SaveMilestoneResource when calling fromMilestone', () => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const {project, name, type, date, header, craft, description, position} = milestone;
        const saveMilestoneResource = new SaveMilestoneResource(
            project.id,
            name,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            header,
            craft.id,
            null,
            description,
            position,
        );

        expect(SaveMilestoneResource.fromMilestone(milestone)).toEqual(saveMilestoneResource);
    });

    it('should return a workarea SaveMilestoneResource when calling fromMilestone', () => {
        const milestone = MOCK_MILESTONE_WORKAREA;
        const {project, name, type, date, header, workArea, description, position} = milestone;
        const saveMilestoneResource = new SaveMilestoneResource(
            project.id,
            name,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            header,
            null,
            workArea.id,
            description,
            position,
        );

        expect(SaveMilestoneResource.fromMilestone(milestone)).toEqual(saveMilestoneResource);
    });

    it('should return a header SaveMilestoneResource when calling fromFormData', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const milestoneFormData: MilestoneFormData = MOCK_MILESTONE_HEADER_FORM_DATA;
        const {title, description, date, type: {marker: {type}}} = milestoneFormData;

        const saveMilestoneResource = new SaveMilestoneResource(
            milestone.project.id,
            title,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            true,
            null,
            null,
            description,
        );

        expect(SaveMilestoneResource.fromFormData(milestone.project.id, milestoneFormData)).toEqual(saveMilestoneResource);
    });

    it('should return a craft SaveMilestoneResource when calling fromFormData', () => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const milestoneFormData: MilestoneFormData = MOCK_MILESTONE_CRAFT_FORM_DATA;
        const {title, description, date, type: {marker: {type}, craftId}} = milestoneFormData;

        const saveMilestoneResource = new SaveMilestoneResource(
            milestone.project.id,
            title,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            false,
            craftId,
            null,
            description,
        );

        expect(SaveMilestoneResource.fromFormData(milestone.project.id, milestoneFormData)).toEqual(saveMilestoneResource);
    });

    it('should return a workarea SaveMilestoneResource when calling fromFormData', () => {
        const milestone = MOCK_MILESTONE_WORKAREA;
        const milestoneFormData: MilestoneFormData = MOCK_MILESTONE_WORKAREA_FORM_DATA;
        const {title, location, description, date, type: {marker: {type}}} = milestoneFormData;

        const saveMilestoneResource = new SaveMilestoneResource(
            milestone.project.id,
            title,
            type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            false,
            null,
            location,
            description,
        );

        expect(SaveMilestoneResource.fromFormData(milestone.project.id, milestoneFormData)).toEqual(saveMilestoneResource);
    });

    it('should return SaveMilestoneResource with updated position', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const position = 3;
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone);
        saveMilestoneResource.position = position;

        expect(SaveMilestoneResource.fromMilestone(milestone).withPosition(position)).toEqual(saveMilestoneResource);
    });

    it('should return SaveMilestoneResource with updated date', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const date = moment('2020-03-20');
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone);
        saveMilestoneResource.date = date.format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        expect(SaveMilestoneResource.fromMilestone(milestone).withDate(date)).toEqual(saveMilestoneResource);
    });

    it('should return SaveMilestoneResource with updated no-workarea location', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const location: RowId = 'no-row';
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone);
        saveMilestoneResource.workAreaId = null;
        saveMilestoneResource.header = false;

        expect(SaveMilestoneResource.fromMilestone(milestone).withLocation(location)).toEqual(saveMilestoneResource);
    });

    it('should return SaveMilestoneResource with updated header location', () => {
        const milestone = MOCK_MILESTONE_WORKAREA;
        const location: RowId = 'header';
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone);
        saveMilestoneResource.workAreaId = null;
        saveMilestoneResource.header = true;

        expect(SaveMilestoneResource.fromMilestone(milestone).withLocation(location)).toEqual(saveMilestoneResource);
    });

    it('should return SaveMilestoneResource with updated workarea location', () => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const location: RowId = 'work-area-id';
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone);
        saveMilestoneResource.workAreaId = location;
        saveMilestoneResource.header = false;

        expect(SaveMilestoneResource.fromMilestone(milestone).withLocation(location)).toEqual(saveMilestoneResource);
    });
});
