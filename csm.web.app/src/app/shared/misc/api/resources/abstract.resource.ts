/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {xorWith} from 'lodash';

export abstract class AbstractResource {
    public id: string;
    public version?: number;

    public static isEqual(a: AbstractResource, b: AbstractResource): boolean {
        return a.id === b.id && a.version === b.version;
    }

    public static isEqualArray<T extends AbstractResource>(a: T[], b: T[]): boolean {
        return !xorWith(a, b, AbstractResource.isEqual).length;
    }
}
