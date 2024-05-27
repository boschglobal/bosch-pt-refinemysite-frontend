/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {SortDirectionEnum} from './sort-direction.enum';

export class SorterData<F extends string = string> {

    constructor(public field: F | '' = '',
                public direction: SortDirectionEnum = SortDirectionEnum.asc) {
    }

    /**
     * @description Retrieves the sort direction as a string
     * @returns {any}
     */
    public static getDirectionString(direction: SortDirectionEnum): string {
        return direction !== SortDirectionEnum.neutral
            ? SortDirectionEnum[direction]
            : SortDirectionEnum[SortDirectionEnum.asc];
    }

    /**
     * @description Retrieves the sort field as a string
     * @returns {string}
     */
    public static getFieldString<F extends string>(direction: SortDirectionEnum, field: F): string {
        return direction !== SortDirectionEnum.neutral ? field : '';
    }
}
