/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {ParticipantStatusEnum} from '../../../enums/participant-status.enum';

export class ProjectParticipantResource {
    public company: ResourceReference;
    public crafts?: ResourceReference[];
    public email: string;
    public gender: string;
    public id: string;
    public phoneNumbers?: PhoneNumber[];
    public project: ResourceReference;
    public projectRole: string;
    public status: ParticipantStatusEnum;
    public user: ResourceReferenceWithPicture;
    public version: number;
    public _links: ProjectParticipantLinks;
}

export class ProjectParticipantLinks {
    public self: ResourceLink;
    public delete?: ResourceLink;
    public update?: ResourceLink;
    public resend?: ResourceLink;
}
