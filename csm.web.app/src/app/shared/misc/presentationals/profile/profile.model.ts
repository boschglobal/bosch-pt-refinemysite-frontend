/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {CountryEnum} from '../../../../user/user-common/enums/country.enum';
import {LanguageEnum} from '../../../translation/helper/language.enum';

export interface ProfileModel {
    picture: string;
    gender: string;
    name: string;
    position?: string;
    role?: string;
    crafts: string;
    phoneNumbers: ProfilePhoneNumberModel[];
    email: string;
    locale?: LanguageEnum;
    country?: CountryEnum;
}

export interface ProfilePhoneNumberModel {
    label: string;
    value: string;
}
