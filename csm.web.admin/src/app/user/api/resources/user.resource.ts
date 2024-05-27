/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {PhoneNumber} from '../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../shared/misc/api/resources/abstract-auditable.resource';
import {CountryEnum} from '../../user-common/enums/country.enum';
import {UserPictureResource} from './user-picture.resource';

export class UserResource extends AbstractAuditableResource {
    public _embedded: UserResourceEmbeddeds;
    public _links: UserResourceLinks;
    public admin: boolean;
    public crafts: ResourceReference[];
    public email: string;
    public eulaAccepted: boolean;
    public firstName: string;
    public gender: string;
    public id: string;
    public lastName: string;
    public locked: boolean;
    public phoneNumbers: PhoneNumber[];
    public position: string;
    public roles: string[];
    public country: CountryEnum;
}

export class UserResourceLinks {
    public self: ResourceLink;
    public register?: ResourceLink;
    public update?: ResourceLink;
    public delete?: ResourceLink;
    public unsetAdmin?: ResourceLink;
    public setAdmin?: ResourceLink;
}

class UserResourceEmbeddeds {
    public profilePicture: UserPictureResource;
}
