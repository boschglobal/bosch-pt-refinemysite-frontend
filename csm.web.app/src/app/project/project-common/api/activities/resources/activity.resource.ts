/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AttachmentResource} from '../../attachments/resources/attachment.resource';

export class ActivityResource {
    public id: string;
    public date: Date;
    public user: ResourceReferenceWithPicture;
    public description: ActivityDescription;
    public changes?: string[];
    public _embedded?: ActivityResourceEmbeddeds;
}

class ActivityDescription {
    public template: string;
    public values: ActivityDescriptionValues;
}

export class ActivityDescriptionValues {
    [key: string]: ResourceReferenceActivity;
}

export class ResourceReferenceActivity {
    public type: string;
    public id: string;
    public text: string;
}

class ActivityResourceEmbeddeds {
    public attachments: AttachmentResource;
}
