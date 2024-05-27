/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {FeatureToggleListResourceLinks} from '../api/resources/feature-toggle-list.resource';
import {FeatureToggleResource} from '../api/resources/feature-toggle.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export interface FeatureToggleSlice {
    items: FeatureToggleResource[];
    currentItem: AbstractItem;
    list: AbstractList<FeatureToggleListResourceLinks>;
}

export const FEATURE_TOGGLE_SLICE_INITIAL_STATE: FeatureToggleSlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.Empty
    },
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.Empty
    },
};
