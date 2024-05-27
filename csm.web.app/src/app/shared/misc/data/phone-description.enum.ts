/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../helpers/enum.helper';

export enum PhoneDescriptionEnum {
    Business = 'BUSINESS',
    Home = 'HOME',
    Mobile = 'MOBILE',
    Fax = 'FAX',
    Pager = 'PAGER',
    Organization = 'ORGANIZATION',
    Assistant = 'ASSISTANT',
    Other = 'OTHER'
}

export const PhoneDescriptionEnumHelper = new EnumHelper('PhoneDescriptionEnum', PhoneDescriptionEnum);
