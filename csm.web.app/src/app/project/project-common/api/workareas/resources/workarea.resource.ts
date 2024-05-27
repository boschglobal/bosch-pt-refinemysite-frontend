/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';

export class WorkareaResource {
    public id: string;
    public name: string;
    public position: number;
    public project: ResourceReference;
    public version: number;
    public _links?: WorkareaResourceLinks;
}

export class WorkareaResourceLinks {
    public self: ResourceLink;
    public project: ResourceLink;
    public delete?: ResourceLink;
    public update?: ResourceLink;
}
