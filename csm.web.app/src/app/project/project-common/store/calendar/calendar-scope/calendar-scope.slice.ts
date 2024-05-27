/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';

export interface CalendarScopeSlice {
    expandedWeeks: moment.Moment[];
    focus: ObjectIdentifierPair;
    focusResolveStatus: RequestStatusEnum;
    navigateToElement: ObjectIdentifierPair;
    scopeParameters: CalendarScopeParameters;
}
