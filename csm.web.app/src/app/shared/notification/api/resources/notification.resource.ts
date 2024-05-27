/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {ResourceReference} from '../../../misc/api/datatypes/resource-reference.datatype';
import {TemplateString} from '../../../misc/api/datatypes/template-string.datatype';

export class NotificationResource {
    public id: string;
    public date: string;
    public actor: ResourceReferenceWithPicture;
    public object: ObjectIdentifierPair;
    public summary: TemplateString;
    public changes?: string;
    public context: { [key: string]: ResourceReference };
    public read: boolean;
}
