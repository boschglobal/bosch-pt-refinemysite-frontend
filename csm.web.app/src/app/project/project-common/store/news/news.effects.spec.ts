/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_NEW_A,
    MOCK_NEW_D,
    MOCK_NEWS_LIST
} from '../../../../../test/mocks/news';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {NewsService} from '../../api/news/news.service';
import {NewsListResource} from '../../api/news/resources/news-list.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {ProjectSliceService} from '../projects/project-slice.service';
import {NewsActions} from './news.actions';
import {NewsEffects} from './news.effects';

describe('News Effects', () => {
    let newsEffects: NewsEffects;
    let newsService: any;
    let actions: ReplaySubject<any>;

    const mockProjectSliceService: ProjectSliceService = mock(ProjectSliceService);

    const findAllResponse: Observable<NewsListResource> = of(MOCK_NEWS_LIST);
    const deleteByIdResponse: Observable<WorkareaResource> = of(null);
    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            NewsEffects,
            provideMockActions(() => actions),
            {
                provide: NewsService,
                useValue: jasmine.createSpyObj('NewsService', ['findAll', 'findAllIncludeNested', 'deleteById', 'deleteAll']),
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            newsSlice: {
                                items: [],
                            },
                        },
                    }
                ),
            },
            {
                provide: ProjectSliceService,
                useValue: instance(mockProjectSliceService),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();

        when(mockProjectSliceService.observeCurrentProjectId()).thenReturn(of('foo'));
    }));

    beforeEach(() => {
        newsEffects = TestBed.inject(NewsEffects);
        newsService = TestBed.inject(NewsService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a RequestAllFulfilled for multiple contexts', () => {
        const expectedResult = new NewsActions.Request.AllNewsFulfilled(MOCK_NEWS_LIST);

        newsService.findAll.and.returnValue(findAllResponse);
        actions.next(new NewsActions.Request.AllNews([MOCK_NEW_A.context, MOCK_NEW_D.context]));
        newsEffects.requestNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllRejected for multiple contexts', () => {
        const expectedResult = new NewsActions.Request.AllNewsRejected();

        newsService.findAll.and.returnValue(errorResponse);
        actions.next(new NewsActions.Request.AllNews([MOCK_NEW_A.context, MOCK_NEW_D.context]));
        newsEffects.requestNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllFulfilled for single context', () => {
        const expectedResult = new NewsActions.Request.AllNewsFulfilled(MOCK_NEWS_LIST);

        newsService.findAllIncludeNested.and.returnValue(findAllResponse);
        actions.next(new NewsActions.Request.AllNews([MOCK_NEW_A.context]));
        newsEffects.requestNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllRejected for single context', () => {
        const expectedResult = new NewsActions.Request.AllNewsRejected();

        newsService.findAllIncludeNested.and.returnValue(errorResponse);
        actions.next(new NewsActions.Request.AllNews([MOCK_NEW_A.context]));
        newsEffects.requestNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a DeleteFulfilled after deleting news successfully', () => {
        const expectedResult = new NewsActions.Delete.NewsFulfilled(MOCK_NEW_A.context);

        newsService.deleteById.and.returnValue(deleteByIdResponse);
        actions.next(new NewsActions.Delete.News(MOCK_NEW_A.context));
        newsEffects.deleteNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a DeleteRejected after deleting news has failed', () => {
        const expectedResult = new NewsActions.Delete.NewsRejected();

        newsService.deleteById.and.returnValue(errorResponse);
        actions.next(new NewsActions.Delete.News(MOCK_NEW_A.context));
        newsEffects.deleteNews$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a DeleteAllFulfilled and SuccessAlert after deleting all news successfully', () => {
        const results: Action[] = [];

        const expectedResult: [NewsActions.Delete.AllNewsFulfilled, AlertActions.Add.SuccessAlert] = [
            new NewsActions.Delete.AllNewsFulfilled(),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Calendar_DeleteAll_SuccessAlertMessage')}),
        ];

        newsService.deleteAll.and.returnValue(deleteByIdResponse);
        actions.next(new NewsActions.Delete.AllNews());
        newsEffects.deleteAllNews$.subscribe(result => results.push(result));

        const firstResult = results[0];
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(expectedResult[0]);
        expect(secondResult.type).toBe(expectedResult[1].type);
        expect(secondResult.payload.type).toBe(expectedResult[1].payload.type);
        expect(secondResult.payload.message).toEqual(expectedResult[1].payload.message);
    });

    it('should trigger a DeleteAllRejected after deleting all news has failed', (done) => {
        const expectedResult = new NewsActions.Delete.AllNewsRejected();

        newsService.deleteAll.and.returnValue(errorResponse);
        actions.next(new NewsActions.Delete.AllNews());
        newsEffects.deleteAllNews$.subscribe((result) => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });
});
