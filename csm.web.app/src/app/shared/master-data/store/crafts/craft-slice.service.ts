/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {
    filter,
    map
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CraftResource} from '../../../../craft/api/resources/craft.resource';
import {CraftQueries} from './craft.queries';
import {CraftSlice} from './craft.slice';

@Injectable({
    providedIn: 'root',
})
export class CraftSliceService {

    private _craftQueries: CraftQueries = new CraftQueries();

    constructor(private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    /**
     * @description Return observable of all crafts
     * @returns {Observable<CraftResource[]>}
     */
    public observeCraftList(): Observable<CraftResource[]> {
        return this._store
            .pipe(
                select(this._craftQueries.getCraftSlice()),
                filter((slice: CraftSlice) => slice.list[this._translateService.defaultLang].length),
                map((slice: CraftSlice) => slice.list[this._translateService.defaultLang]));
    }

    /**
     * @description Return observable of a craft selected by id
     * @param {string} id
     * @returns {Observable<CraftResource>}
     */
    public observeCraftById(id: string): Observable<CraftResource> {
        return this._store
            .pipe(
                select(this._craftQueries.getCraftSlice()),
                filter((slice: CraftSlice) => slice.list[this._translateService.defaultLang].length),
                map((slice: CraftSlice) => slice.list[this._translateService.defaultLang]
                    .find((craft: CraftResource) => craft.id === id)));
    }
}
