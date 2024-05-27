/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {
    flatten,
    isEqual
} from 'lodash';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {NewsResource} from '../../api/news/resources/news.resource';

@Injectable({
    providedIn: 'root',
})
export class NewsQueries {

    public moduleName = 'projectModule';

    public sliceName = 'newsSlice';

    constructor(private _store: Store<State>) {
    }

    public observeAllItems(): Observable<NewsResource[]> {
        return this._store
            .pipe(
                select(this.getAllItems()),
                distinctUntilChanged());
    }

    public observeItemsByIdentifierPair(identifiers: ObjectIdentifierPair[]): Observable<NewsResource[]> {
        return this._store
            .pipe(
                select(this.getItemsByIdentifierPair(identifiers)),
                distinctUntilChanged(isEqual));
    }

    public observeItemsByParentIdentifierPair(identifiers: ObjectIdentifierPair[]): Observable<NewsResource[]> {
        return this._store
            .pipe(
                select(this.getItemsByParentIdentifierPair(identifiers)),
                distinctUntilChanged(isEqual));
    }

    public getAllItems(): (state: State) => NewsResource[] {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].items;
        };
    }

    public getItemsByIdentifierPair(contexts: ObjectIdentifierPair[]): (state: State) => NewsResource[] {
        return (state: State) => {
            return contexts
                .map((context) => this._findItemByIdentifierPair(state[this.moduleName][this.sliceName].items, context))
                .filter((item: NewsResource) => typeof item !== 'undefined');
        };
    }

    public getItemsByParentIdentifierPair(contexts: ObjectIdentifierPair[]): (state: State) => NewsResource[] {
        return (state: State) => {
            const items: NewsResource[][] = contexts
                .map((context) => this._findItemByParentIdentifierPair(state[this.moduleName][this.sliceName].items, context));

            return flatten(items)
                .filter((item: NewsResource) => typeof item !== 'undefined');
        };
    }

    private _findItemByIdentifierPair(items: NewsResource[], context: ObjectIdentifierPair): NewsResource {
        return items
            .find((item: NewsResource) => item.context.isSame(context));
    }

    private _findItemByParentIdentifierPair(items: NewsResource[], context: ObjectIdentifierPair): NewsResource[] {
        return items
            .filter((item: NewsResource) => item.parent.isSame(context));
    }
}
