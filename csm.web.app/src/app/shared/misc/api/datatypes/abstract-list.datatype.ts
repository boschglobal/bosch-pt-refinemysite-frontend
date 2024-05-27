/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';
import {ResourceLink} from './resource-link.datatype';

export class AbstractList<L = {[key: string]: ResourceLink}> {
    public ids: string[] = [];
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
    public version?: number;
    public _links?: L;
}
