/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_NEWS_ITEMS,
    MOCK_NEWS_LIST
} from '../../../../../test/mocks/news';
import {NewsActions} from './news.actions';
import {NEWS_SLICE_INITIAL_STATE} from './news.initial-state';
import {NEWS_REDUCER} from './news.reducer';
import {NewsSlice} from './news.slice';

describe('News Reducer', () => {
    let initialState: NewsSlice;
    let midState: NewsSlice;
    let nextState: NewsSlice;

    beforeEach(() => {
        initialState = NEWS_SLICE_INITIAL_STATE;
        nextState = cloneDeep(NEWS_SLICE_INITIAL_STATE);
        midState = cloneDeep(Object.assign({}, NEWS_SLICE_INITIAL_STATE, {items: MOCK_NEWS_ITEMS}));
    });

    it('should handle InitializeAll', () => {
        const action = new NewsActions.Initialize.News();
        expect(NEWS_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle DeleteAllFulfilled', () => {
        const action = new NewsActions.Delete.AllNewsFulfilled();

        expect(NEWS_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle DeleteFulfilled', () => {
        const action = new NewsActions.Delete.NewsFulfilled(MOCK_NEWS_ITEMS[0].context);

        nextState = Object.assign({}, NEWS_SLICE_INITIAL_STATE, {items: [MOCK_NEWS_ITEMS[3]]});
        expect(NEWS_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RequestAllFulfilled', () => {
        const action = new NewsActions.Request.AllNewsFulfilled(MOCK_NEWS_LIST);

        nextState = Object.assign({}, NEWS_SLICE_INITIAL_STATE, {items: MOCK_NEWS_ITEMS});
        expect(NEWS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(NEWS_REDUCER(initialState, defaultAction)).toEqual(initialState);
    });
});
