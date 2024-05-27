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
import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {CountryEnum} from '../../user-common/enums/country.enum';
import {UserPictureResource} from './user-picture.resource';

export class UserResource extends AbstractAuditableResource {
    public id: string;
    public gender: string;
    public firstName: string;
    public lastName: string;
    public locale?: LanguageEnum;
    public country?: CountryEnum;
    public email: string;
    public position: string;
    public roles: string[];
    public crafts: ResourceReference[];
    public phoneNumbers: PhoneNumber[];
    public _links: UserResourceLinks;
    public _embedded: UserResourceEmbeddeds;
    public eulaAccepted: boolean;
}

export class UserResourceLinks {
    public self: ResourceLink;
    public register?: ResourceLink;
    public update?: ResourceLink;
}

class UserResourceEmbeddeds {
    public profilePicture: UserPictureResource;
}
