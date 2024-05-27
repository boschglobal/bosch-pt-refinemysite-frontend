/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractFilters} from '../../../../../shared/misc/store/datatypes/abstract-filters.datatype';
import {CommonFilterFormData} from '../../../containers/common-filter-capture/common-filter-capture.component';
import {TasksFilterFormData} from '../../../containers/tasks-filter-capture/tasks-filter-capture.component';
import {ProjectTaskFiltersCriteria} from './project-task-filters-criteria';

export class ProjectTaskFilters extends AbstractFilters {

    constructor(public criteria: ProjectTaskFiltersCriteria = new ProjectTaskFiltersCriteria(),
                public useCriteria: boolean = true,
                public highlight: boolean = false) {
        super();
    }

    public static fromFormData(formData: TasksFilterFormData, commonFilters: CommonFilterFormData): ProjectTaskFilters {
        const criteria = ProjectTaskFiltersCriteria.fromFormData(formData, commonFilters);

        return Object.assign(new ProjectTaskFilters(), {
            criteria,
        });
    }
}
