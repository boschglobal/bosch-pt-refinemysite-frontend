/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from '../datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../datatypes/resource-reference-with-picture.datatype';
import {AbstractResource} from './abstract.resource';

export abstract class AbstractAuditableResource extends AbstractResource {
    public createdBy: ResourceReferenceWithPicture | ResourceReference;
    public createdDate: string;
    public lastModifiedBy: ResourceReference;
    public lastModifiedDate: string;
}
