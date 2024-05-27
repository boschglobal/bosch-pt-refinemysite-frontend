/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../misc/helpers/enum.helper';

export enum CultureLanguageEnum {
    enCA = 'en-CA',
    enUS = 'en-US',
    esUS = 'es-US',
    frCA = 'fr-CA',
}

export const CultureLanguageEnumHelper = new EnumHelper('CultureLanguageEnum', CultureLanguageEnum);
