/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NamedEnumReference} from '../../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {
    AbstractItemsResource,
    AbstractItemsResourceLinks
} from '../../../../../shared/misc/api/resources/abstract-items.resource';
import {ConstraintKey} from '../../constraints/resources/constraint.resource';

export class TaskConstraintsResource extends AbstractItemsResource<NamedEnumReference<ConstraintKey>> {
    public version: number;
    public taskId: string;
    public _links: TaskConstraintsResourceLinks;
}

export class TaskConstraintsResourceLinks extends AbstractItemsResourceLinks {
    public update?: ResourceLink;
}
