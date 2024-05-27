/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

/* eslint-disable @typescript-eslint/naming-convention */
/* Rule disabled due to the need to have enum members in lowercase to match the language configuration of the i18n lib */

export enum DatepickerDateFormatEnum {
    en = 'MM/DD/YYYY',
    de = 'DD.MM.YYYY',
    es = 'DD/MM/YYYY',
    pt = 'DD/MM/YYYY',
    fr = 'DD/MM/YYYY',
}

export enum DatepickerMaskEnum {
    en = '99/99/9999',
    de = '99.99.9999',
    es = '99/99/9999',
    pt = '99/99/9999',
    fr = '99/99/9999',
}

export enum DatepickerPlaceholderEnum {
    en = 'mm/dd/yyyy',
    de = 'TT.MM.JJJJ',
    es = 'dd/mm/aaaa',
    pt = 'dd/mm/aaaa',
    fr = 'jj/mm/aaaa',
}
