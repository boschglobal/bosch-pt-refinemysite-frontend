/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {WorkareaResource} from './workarea.resource';

export class WorkareaListResource {
    public workAreas: WorkareaResource[];
    public version: number;
    public _links: WorkareaListLinks;
}

export class WorkareaListLinks {
    public self: ResourceLink;
    public create?: ResourceLink;
}
