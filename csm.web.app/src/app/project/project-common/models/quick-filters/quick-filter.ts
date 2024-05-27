/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ProjectFiltersCriteriaResource} from '../../api/misc/resources/project-filters-criteria.resource';
import {
    QuickFilterLinks,
    QuickFilterResource,
} from '../../api/quick-filters/resources/quick-filter.resource';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria,
} from '../../store/tasks/slice/project-task-filters-criteria';

export type QuickFilterId = 'all' | 'my-company' | 'my-tasks' | string;

export class QuickFilterPermissions {
    public canUpdate: boolean;
    public canDelete: boolean;
}

export class QuickFilter extends AbstractResource {
    public id: QuickFilterId;
    public name: string;
    public criteria: ProjectFiltersCriteriaResource;
    public useMilestoneCriteria: boolean;
    public useTaskCriteria: boolean;
    public highlight: boolean;
    public permissions: QuickFilterPermissions;

    public static fromQuickFilterResource(quickFilterResource: QuickFilterResource): QuickFilter {
        if (!quickFilterResource) {
            return null;
        }

        const {
            id,
            version,
            name,
            criteria,
            highlight,
            useMilestoneCriteria,
            useTaskCriteria,
            _links,
        } = quickFilterResource;

        return {
            id,
            version,
            name,
            highlight,
            useMilestoneCriteria,
            useTaskCriteria,
            criteria: QuickFilter._mapProjectFiltersCriteriaResource(criteria),
            permissions: QuickFilter._mapLinksToPermissions(_links),
        };
    }

    private static _mapLinksToPermissions(links: QuickFilterLinks): QuickFilterPermissions {
        return {
            canUpdate: 'update' in links,
            canDelete: 'delete' in links,
        };
    }

    private static _mapProjectFiltersCriteriaResource(criteria: ProjectFiltersCriteriaResource): ProjectFiltersCriteriaResource {
        const tasks = QuickFilter._mapProjectTaskFiltersCriteria(criteria.tasks);
        const milestones = QuickFilter._mapMilestoneFiltersCriteria(criteria.milestones);

        return Object.assign<ProjectFiltersCriteriaResource, ProjectFiltersCriteriaResource>(new ProjectFiltersCriteriaResource(), {
            tasks,
            milestones,
        });
    }

    private static _mapMilestoneFiltersCriteria(criteria: MilestoneFiltersCriteria): MilestoneFiltersCriteria {
        const {
            from,
            to,
        } = criteria;

        return Object.assign(new MilestoneFiltersCriteria(), criteria, {
            from: from ? moment(from) : null,
            to: to ? moment(to) : null,
        });
    }

    private static _mapProjectTaskFiltersCriteria(criteria: ProjectTaskFiltersCriteria): ProjectTaskFiltersCriteria {
        const {
            assignees: {
                participantIds,
                companyIds,
            },
            from,
            to,
            hasTopics,
        } = criteria;

        return Object.assign(new ProjectTaskFiltersCriteria(), criteria, {
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            from: from ? moment(from) : null,
            to: to ? moment(to) : null,
            hasTopics: hasTopics || null,
        });
    }
}
