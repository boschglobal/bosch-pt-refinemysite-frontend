/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../misc/helpers/enum.helper';

export enum CultureLanguageFallbackEnum {
    en = 'en-GB',
    de = 'de-DE',
    es = 'es-ES',
    fr = 'fr-FR',
    pt = 'pt-PT',
}

export const CultureLanguageFallbackEnumHelper = new EnumHelper('CultureLanguageFallbackEnum', CultureLanguageFallbackEnum);
