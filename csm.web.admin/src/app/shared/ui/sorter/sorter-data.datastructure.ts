
/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {SortDirectionEnum} from './sort-direction.enum';

export class SorterData {
    constructor(public field = '',
                public direction: SortDirectionEnum = SortDirectionEnum.Asc) {
    }
    /**
     * @description Retrieves the sort direction as a string
     * @returns {any}
     */
    public static getDirectionString(direction: SortDirectionEnum): string {
        return direction !== SortDirectionEnum.Neutral
            ? SortDirectionEnum[direction]
            : SortDirectionEnum[SortDirectionEnum.Asc];
    }

    /**
     * @description Retrieves the sort field as a string
     * @returns {string}
     */
    public static getFieldString(direction: SortDirectionEnum, field: string): string {
        return direction !== SortDirectionEnum.Neutral ? field : '';
    }
}
