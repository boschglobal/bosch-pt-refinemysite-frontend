/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {PATResource} from './pat.resource';

export class PATListResource {
    public items: PATResource[];
    public _links: PATListLinks;
}

export class PATListLinks {
    public create?: ResourceLink;
}
