/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {SaveProjectFiltersCriteriaResource} from '../../misc/resources/save-project-filters-criteria.resource';

export class SaveRescheduleResource {
    public shiftDays: number;
    public useTaskCriteria: boolean;
    public useMilestoneCriteria: boolean;
    public criteria: SaveProjectFiltersCriteriaResource;
}
