/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {isEqualWith} from 'lodash';

import {AbstractFiltersCriteria} from './abstract-filters-criteria.datatype';

export class AbstractFilters {
    public criteria: AbstractFiltersCriteria;

    public static isEqual<T extends AbstractFilters>(filterA: T, filterB: T): boolean {
        return isEqualWith(filterA, filterB, (valueA, valueB, key: keyof T) =>
            key === 'criteria' ? AbstractFiltersCriteria.isEqual<AbstractFiltersCriteria>(valueA, valueB) : undefined);
    }
}
