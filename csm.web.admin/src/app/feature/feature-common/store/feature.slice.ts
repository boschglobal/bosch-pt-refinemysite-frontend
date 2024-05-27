/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractList} from '../../../shared/misc/api/datatypes/abstract-list.datatype';
import {FeatureListResourceLinks} from '../api/resources/feature-list.resource';
import {FeatureResource} from '../api/resources/feature.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export interface FeatureSlice {
    items: FeatureResource[];
    currentItem: AbstractItem;
    list: AbstractList<FeatureListResourceLinks>;
}

export const FEATURE_SLICE_INITIAL_STATE: FeatureSlice = {
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
