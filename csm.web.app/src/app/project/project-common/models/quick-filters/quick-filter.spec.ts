/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment/moment';

import {
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_QUICK_FILTER_WITH_DATE_CRITERIA,
    MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS,
} from '../../../../../test/mocks/quick-filters';
import {ProjectFiltersCriteriaResource} from '../../api/misc/resources/project-filters-criteria.resource';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {
    QuickFilter,
    QuickFilterPermissions,
} from './quick-filter';

describe('Quick Filter', () => {

    it('should return null if the quick filter resource is null when fromQuickFilterResource is called', () => {
        const quickFilterResource = null;

        expect(QuickFilter.fromQuickFilterResource(quickFilterResource)).toBeNull();
    });

    it('should return null if the quick filter resource is undefined when fromQuickFilterResource is called', () => {
        const quickFilterResource = undefined;

        expect(QuickFilter.fromQuickFilterResource(quickFilterResource)).toBeNull();
    });

    it('should return a quick filter with default criteria when fromQuickFilterResource is called with default criteria', () => {
        const quickFilterResource = MOCK_QUICK_FILTER_RESOURCE;
        const {
            id,
            version,
            name,
            criteria,
            useMilestoneCriteria,
            useTaskCriteria,
            highlight,
        } = quickFilterResource;
        const expectedQuickFilter: QuickFilter = {
            id,
            version,
            name,
            criteria,
            useMilestoneCriteria,
            useTaskCriteria,
            highlight,
            permissions: {
                canUpdate: true,
                canDelete: true,
            },
        };

        expect(QuickFilter.fromQuickFilterResource(quickFilterResource)).toEqual(expectedQuickFilter);
    });

    it('should return a quick filter with dates when fromQuickFilterResource is called with those dated', () => {
        const quickFilterResource = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const {
            tasks: expectedTaskCriteria,
            milestones: expectedMilestoneCriteria,
        } = quickFilterResource.criteria;
        const {criteria: {milestones, tasks}} = QuickFilter.fromQuickFilterResource(quickFilterResource);

        expect(milestones.from).toEqual(moment(expectedMilestoneCriteria.from));
        expect(milestones.to).toEqual(moment(expectedMilestoneCriteria.to));
        expect(tasks.from).toEqual(moment(expectedTaskCriteria.from));
        expect(tasks.to).toEqual(moment(expectedTaskCriteria.to));
    });

    it('should return a quick filter with only "from" date when fromQuickFilterResource is called with only "from"', () => {
        const quickFilterResource = Object.assign(new QuickFilterResource(), MOCK_QUICK_FILTER_RESOURCE, {
            criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                    from: moment('2019-12-19'),
                }),
                milestones: Object.assign(new MilestoneFiltersCriteria(), {
                    from: moment('2019-12-19'),
                }),
            }),
        });
        const {
            tasks: expectedTaskCriteria,
            milestones: expectedMilestoneCriteria,
        } = quickFilterResource.criteria;
        const {criteria: {milestones, tasks}} = QuickFilter.fromQuickFilterResource(quickFilterResource);

        expect(milestones.from).toEqual(moment(expectedMilestoneCriteria.from));
        expect(milestones.to).toBeNull();
        expect(tasks.from).toEqual(moment(expectedTaskCriteria.from));
        expect(tasks.to).toBeNull();
    });

    it('should return a quick filter with only "to" date when fromQuickFilterResource is called with only "to"', () => {
        const quickFilterResource = Object.assign(new QuickFilterResource(), MOCK_QUICK_FILTER_RESOURCE, {
            criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                    to: moment('2019-12-20'),
                }),
                milestones: Object.assign(new MilestoneFiltersCriteria(), {
                    to: moment('2019-12-20'),
                }),
            }),
        });

        const {
            tasks: expectedTaskCriteria,
            milestones: expectedMilestoneCriteria,
        } = quickFilterResource.criteria;
        const {criteria: {milestones, tasks}} = QuickFilter.fromQuickFilterResource(quickFilterResource);

        expect(milestones.from).toBeNull();
        expect(milestones.to).toEqual(moment(expectedMilestoneCriteria.to));
        expect(tasks.from).toBeNull();
        expect(tasks.to).toEqual(moment(expectedTaskCriteria.to));
    });

    it('should return a quick filter without any permissions when fromQuickFilterResource is called without permission links', () => {
        const quickFilterResource = MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS;
        const expectedPermissions: QuickFilterPermissions = {
            canUpdate: false,
            canDelete: false,
        };

        expect(QuickFilter.fromQuickFilterResource(quickFilterResource).permissions).toEqual(expectedPermissions);
    });

    it('should return a quick filter with the hasTopics task criteria as true when fromQuickFilterResource ' +
        'is called with the truthy hasTopics value', () => {
        const quickFilterResource = {
            ...MOCK_QUICK_FILTER_RESOURCE,
            criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                tasks: Object.assign(new ProjectTaskFiltersCriteria(), {hasTopics: true}),
            }),
        };
        const {criteria: {tasks}} = QuickFilter.fromQuickFilterResource(quickFilterResource);

        expect(tasks.hasTopics).toBe(true);
    });
});
