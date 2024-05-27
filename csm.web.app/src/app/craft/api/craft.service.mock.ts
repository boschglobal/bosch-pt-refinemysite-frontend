/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Observable,
    of
} from 'rxjs';

import {CRAFT_LIST_RESOURCE_MOCK} from '../../../test/mocks/crafts';
import {CraftListResource} from './resources/craft-list.resource';

export class CraftServiceMock {
    public findAll(): Observable<CraftListResource> {
        return of(CRAFT_LIST_RESOURCE_MOCK);
    }
}
