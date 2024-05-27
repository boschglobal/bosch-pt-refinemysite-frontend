/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {JobListLinks} from '../api/resources/job-list.resource';
import {JobResource} from '../api/resources/job.resource';

export interface JobSlice {
    items: JobResource[];
    list: AbstractMarkableList<JobListLinks>;
    watchingIds: string[];
}
