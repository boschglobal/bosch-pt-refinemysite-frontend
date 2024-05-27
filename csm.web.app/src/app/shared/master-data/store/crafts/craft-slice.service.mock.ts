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

import {CraftResource} from '../../../../craft/api/resources/craft.resource';

export class CraftSliceServiceMock {

    public observeCraftList() {
    }

    public observeCraftById(id: string): Observable<CraftResource> {
        const craft: CraftResource = {name: 'Craft', id: '12345', _links: {self: {href: ''}}};
        return of(craft);
    }
}
