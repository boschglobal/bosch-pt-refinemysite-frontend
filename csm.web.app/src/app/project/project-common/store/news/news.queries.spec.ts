/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MOCK_NEWS_ITEMS} from '../../../../../test/mocks/news';
import {MockStore} from '../../../../../test/mocks/store';
import {NewsResource} from '../../api/news/resources/news.resource';
import {NewsQueries} from './news.queries';

describe('News Queries', () => {
    let newsQueries: NewsQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            NewsQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            newsSlice: {
                                items: MOCK_NEWS_ITEMS,
                            },
                        },
                    }
                ),
            },
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => newsQueries = TestBed.inject(NewsQueries));

    it('should observe all news', () => {
        newsQueries
            .observeAllItems()
            .subscribe((result: NewsResource[]) =>
                expect(result).toEqual(MOCK_NEWS_ITEMS));
    });

    it('should observe news by self identifier pair', () => {
        const referenceNew = MOCK_NEWS_ITEMS[0];
        const expectedNews = MOCK_NEWS_ITEMS.filter((item) => item.context.isSame(referenceNew.context));

        newsQueries
            .observeItemsByIdentifierPair([referenceNew.context])
            .subscribe((result: NewsResource[]) =>
                expect(result).toEqual(expectedNews));
    });

    it('should observe news by parent identifier pair', () => {
        const referenceNew = MOCK_NEWS_ITEMS[0];
        const expectedNews = MOCK_NEWS_ITEMS.filter((item) => item.parent.isSame(referenceNew.context));

        newsQueries
            .observeItemsByParentIdentifierPair([referenceNew.context])
            .subscribe((result: NewsResource[]) =>
                expect(result).toEqual(expectedNews));
    });
});
