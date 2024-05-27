/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    CRAFT_LIST_RESOURCE_MOCK,
    CRAFT_RESOURCE_LIST_MOCK
} from '../../../../../test/mocks/crafts';
import {CraftListResource} from '../../../../craft/api/resources/craft-list.resource';
import {AbstractLangIndexedList} from '../../../misc/api/datatypes/abstract-lang-indexed-list.datatype';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {CraftActions} from './craft.actions';
import {CRAFT_SLICE_INITIAL_STATE} from './craft.initial-state';
import {CRAFT_REDUCER} from './craft.reducer';
import {CraftSlice} from './craft.slice';

describe('Craft Reducer', () => {
    let initialState: CraftSlice;
    let nextState: CraftSlice;

    beforeEach(() => {
        initialState = CRAFT_SLICE_INITIAL_STATE;
        nextState = cloneDeep(CRAFT_SLICE_INITIAL_STATE);
    });

    it('should handle REQUEST_CRAFTS', () => {
        const action: Action = new CraftActions.Request.Crafts();
        nextState.requestStatus = RequestStatusEnum.progress;
        expect(CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_CRAFTS_FULFILLED', () => {
        const projectListResource: CraftListResource = CRAFT_LIST_RESOURCE_MOCK;
        const currentLang = 'en';
        const action: Action = new CraftActions.Request.CraftsFulfilled({currentLang, ...projectListResource});

        nextState.list = Object.assign(new AbstractLangIndexedList(), nextState.list, {
                [currentLang]: CRAFT_RESOURCE_LIST_MOCK
            }
        );

        nextState.used = true;
        nextState.requestStatus = RequestStatusEnum.success;
        expect(CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_CRAFTS_REJECTED', () => {
        nextState.requestStatus = RequestStatusEnum.error;
        expect(CRAFT_REDUCER(initialState, new CraftActions.Request.CraftsRejected())).toEqual(nextState);
    });
});
