/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractResource} from './abstract.resource';
import {ResourceReference} from '../datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../datatypes/resource-reference-with-picture.datatype';
import {ResourceReferenceWithEmail} from '../datatypes/resource-reference-with-email.datatype';

export abstract class AbstractAuditableResource extends AbstractResource {
    public createdBy: ResourceReferenceWithPicture | ResourceReference | ResourceReferenceWithEmail;
    public createdDate: Date;
    public lastModifiedBy: ResourceReference;
    public lastModifiedDate: Date;
}
