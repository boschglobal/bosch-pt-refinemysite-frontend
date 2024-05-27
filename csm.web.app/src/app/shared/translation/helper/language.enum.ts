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
    PT = 'pt',
    FR = 'fr',
}

export const LanguageEnumHelper = new EnumHelper('LanguageEnum', LanguageEnum);
