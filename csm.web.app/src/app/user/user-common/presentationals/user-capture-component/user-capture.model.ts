/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {FormGroupPhoneValueInterface} from '../../../../shared/misc/presentationals/form-group-phone/form-group-phone.component';
import {LanguageEnum} from '../../../../shared/translation/helper/language.enum';
import {CountryEnum} from '../../enums/country.enum';

export class UserCaptureModel {
    public picture: File;
    public gender: string;
    public firstName: string;
    public lastName: string;
    public position: string;
    public crafts: string[];
    public phoneNumbers: FormGroupPhoneValueInterface[];
    public email?: string;
    public locale?: LanguageEnum;
    public country?: CountryEnum;
}
