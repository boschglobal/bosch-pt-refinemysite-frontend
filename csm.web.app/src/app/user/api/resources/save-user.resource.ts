/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {PhoneNumber} from '../../../shared/misc/api/datatypes/phone-number.datatype';
import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {CountryEnum} from '../../user-common/enums/country.enum';

export class SaveUserResource {
    public gender: string;
    public firstName: string;
    public lastName: string;
    public locale?: LanguageEnum;
    public country?: CountryEnum;
    public position?: string;
    public craftIds?: string[];
    public phoneNumbers?: PhoneNumber[];
    public eulaAccepted?: boolean;
}
