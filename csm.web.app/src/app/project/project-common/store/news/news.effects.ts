/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {NewsService} from '../../api/news/news.service';
import {NewsListResource} from '../../api/news/resources/news-list.resource';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    NewsActionEnum,
    NewsActions
} from './news.actions';

@Injectable()
export class NewsEffects {

    constructor(private _actions$: Actions,
                private _newService: NewsService,
                private _projectSliceService: ProjectSliceService) {
    }

    public requestNews$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NewsActionEnum.RequestAll),
            switchMap((action: NewsActions.Request.AllNews) => {
                const items = action.payload;
                const method = items.length > 1 ? 'findAll' : 'findAllIncludeNested';

                return this._newService[method](items.map(item => item.id)).pipe(
                    map((news: NewsListResource) => new NewsActions.Request.AllNewsFulfilled(news)),
                    catchError(() => of(new NewsActions.Request.AllNewsRejected())));
            })));

    public deleteAllNews$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NewsActionEnum.DeleteAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([, projectId]: [NewsActions.Delete.AllNews, string]) =>
                this._newService
                    .deleteAll(projectId)
                    .pipe(
                        mergeMap(() => [
                            new NewsActions.Delete.AllNewsFulfilled(),
                            new AlertActions.Add.SuccessAlert(
                                {message: new AlertMessageResource('Calendar_DeleteAll_SuccessAlertMessage')}
                            ),
                        ]
                        ),
                        catchError(() => of(new NewsActions.Delete.AllNewsRejected()))))));

    public deleteNews$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NewsActionEnum.Delete),
            switchMap((action: NewsActions.Delete.News) =>
                this._newService
                    .deleteById(action.payload.id)
                    .pipe(
                        map(() => new NewsActions.Delete.NewsFulfilled(action.payload)),
                        catchError(() => of(new NewsActions.Delete.NewsRejected()))))));
}
