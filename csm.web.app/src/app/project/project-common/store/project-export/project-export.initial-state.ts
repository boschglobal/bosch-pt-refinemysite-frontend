/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectExportSlice} from './project-export.slice';

export const PROJECT_EXPORT_INITIAL_STATE: ProjectExportSlice = {
    currentItem: new AbstractItem(),
};
