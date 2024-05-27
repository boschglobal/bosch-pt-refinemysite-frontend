/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../misc/helpers/enum.helper';

export enum LanguageEnum {
    EN = 'en',
    DE = 'de',
    ES = 'es',
}

export const languageEnumHelper = new EnumHelper('LanguageEnum', LanguageEnum);
