/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {
    ObjectTypeEnum,
    ObjectTypeEnumHelper,
} from '../../../../shared/misc/enums/object-type.enum';

export const FOCUS_PARAMS_SEPARATOR = '_';

export class TasksCalendarFocusParams {

    constructor(public type: ObjectTypeEnum,
                public params: string[]) {
    }

    public static fromUrl(focusUrlParam = ''): TasksCalendarFocusParams {
        const params = focusUrlParam.split(FOCUS_PARAMS_SEPARATOR);
        const type = params.shift();

        return ObjectTypeEnumHelper.getKeyByValue(type) ? new TasksCalendarFocusParams(type as ObjectTypeEnum, params) : null;
    }

    public toString(): string {
        return [this.type, ...this.params].join(FOCUS_PARAMS_SEPARATOR);
    }

    public toObjectIdentifierPair(): ObjectIdentifierPair | null {
        switch (this.type) {
            case ObjectTypeEnum.Task:
            case ObjectTypeEnum.Milestone: {
                const [id] = this.params;

                return new ObjectIdentifierPair(this.type, id);
            }
            case ObjectTypeEnum.DayCard: {
                const [, daycardId] = this.params;

                return new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycardId);
            }
            default:
                return null;
        }
    }
}
