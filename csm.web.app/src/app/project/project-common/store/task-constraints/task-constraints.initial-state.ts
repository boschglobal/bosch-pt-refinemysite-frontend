/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {TaskConstraints} from '../../models/task-constraints/task-constraints';
import {TaskConstraintsSlice} from './task-constraints.slice';

export const TASK_CONSTRAINTS_INITIAL_STATE: TaskConstraintsSlice = {
    lists: new Map<string, TaskConstraints>(),
};
