/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CraftResource} from '../../../../craft/api/resources/craft.resource';
import {AbstractLangIndexedList} from '../../../misc/api/datatypes/abstract-lang-indexed-list.datatype';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';

export interface CraftSlice {
    used: boolean;
    list: AbstractLangIndexedList<CraftResource>;
    requestStatus: RequestStatusEnum;
}
