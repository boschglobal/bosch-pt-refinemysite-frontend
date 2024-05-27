/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    NewsActionEnum,
    NewsActions
} from './news.actions';

describe('News Actions', () => {
    it('should check NewsActions.Initialize.News() type', () => {
        expect(new NewsActions.Initialize.News().type)
            .toBe(NewsActionEnum.InitializeAll);
    });

    it('should check NewsActions.Delete.AllNews() type', () => {
        expect(new NewsActions.Delete.AllNews().type)
            .toBe(NewsActionEnum.DeleteAll);
    });

    it('should check NewsActions.Delete.News() type', () => {
        expect(new NewsActions.Delete.News(null).type)
            .toBe(NewsActionEnum.Delete);
    });

    it('should check NewsActions.Delete.NewsFulfilled() type', () => {
        expect(new NewsActions.Delete.NewsFulfilled(null).type)
            .toBe(NewsActionEnum.DeleteFulfilled);
    });

    it('should check NewsActions.Delete.AllNewsFulfilled() type', () => {
        expect(new NewsActions.Delete.AllNewsFulfilled().type)
            .toBe(NewsActionEnum.DeleteAllFulfilled);
    });

    it('should check NewsActions.Delete.NewsRejected() type', () => {
        expect(new NewsActions.Delete.NewsRejected().type)
            .toBe(NewsActionEnum.DeleteRejected);
    });

    it('should check NewsActions.Delete.AllNewsRejected() type', () => {
        expect(new NewsActions.Delete.AllNewsRejected().type)
            .toBe(NewsActionEnum.DeleteAllRejected);
    });

    it('should check NewsActions.Request.AllNews() type', () => {
        expect(new NewsActions.Request.AllNews(null).type)
            .toBe(NewsActionEnum.RequestAll);
    });

    it('should check NewsActions.Request.AllNewsFulfilled() type', () => {
        expect(new NewsActions.Request.AllNewsFulfilled(null).type)
            .toBe(NewsActionEnum.RequestAllFulfilled);
    });

    it('should check NewsActions.Request.AllNewsRejected() type', () => {
        expect(new NewsActions.Request.AllNewsRejected().type)
            .toBe(NewsActionEnum.RequestAllRejected);
    });
});
