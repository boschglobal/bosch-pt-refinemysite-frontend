/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TopicCriticalityEnum {
    CRITICAL = 'CRITICAL',
    UNCRITICAL = 'UNCRITICAL'
}

export const TopicCriticalityEnumHelper = new EnumHelper('TopicCriticalityEnum', TopicCriticalityEnum);
