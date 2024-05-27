/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {UUID} from '../../misc/identification/uuid';
import {AlertResource} from '../api/resources/alert.resource';
import {AnnouncementResource} from '../api/resources/announcement.resource';
import {AnnouncementListResource} from '../api/resources/announcement-list.resource';
import {AlertTypeEnum} from '../enums/alert-type.enum';
import {
    AlertActionEnum,
    AlertActions
} from './alert.actions';
import {ALERT_SLICE_INITIAL_STATE} from './alert.initial-state';
import {ALERT_REDUCER} from './alert.reducer';
import {AlertSlice} from './alert.slice';

describe('Alert Reducer', () => {
    let initialState: AlertSlice;
    let midState: AlertSlice;
    let nextState: AlertSlice;

    beforeEach(() => {
        initialState = ALERT_SLICE_INITIAL_STATE;
        midState = cloneDeep(ALERT_SLICE_INITIAL_STATE);
        nextState = cloneDeep(ALERT_SLICE_INITIAL_STATE);
    });

    it('should handle AlertActions.Add.Alert', () => {
        const id = UUID.v4();
        const payload = new AlertResource(AlertTypeEnum.Success, {text: '123'}, id);
        const action: AlertActions = {
            type: AlertActionEnum.AddAlert,
            payload,
        };

        nextState = Object.assign({}, initialState, {
            alerts: [new AlertResource(AlertTypeEnum.Success, {text: '123'}, id)],
        });

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Remove.Alert', () => {
        const id = UUID.v4();
        const removeAction: AlertActions = {
            type: AlertActionEnum.RemoveAlert,
            payload: id,
        };

        midState = Object.assign({}, initialState, {
            alerts: [new AlertResource(AlertTypeEnum.Success, {text: '123'}, id)],
        });

        nextState = Object.assign({}, midState, {
            alerts: [],
        });

        expect(ALERT_REDUCER(midState, removeAction)).toEqual(nextState);
    });

    it('should handle AlertActions.Remove.RemoveAllAlerts', () => {
        const action: AlertActions = {
            type: AlertActionEnum.RemoveAllAlerts,
        };

        midState = Object.assign({}, initialState, {
            alerts: [
                new AlertResource(AlertTypeEnum.Success, {text: '123'}),
                new AlertResource(AlertTypeEnum.Error, {text: '321'}),
                new AlertResource(AlertTypeEnum.Warning, {text: '765'}),
            ],
            announcements: [
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Foo'),
            ],
        });

        nextState = Object.assign({}, midState, {
            alerts: [],
        });

        expect(ALERT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Add.Announcements', () => {
        const payload: AnnouncementListResource = {
            items: [
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Foo'),
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Bar'),
            ],
        };
        const action: AlertActions = {
            type: AlertActionEnum.AddAnnouncements,
            payload,
        };

        nextState = Object.assign({}, initialState, {
            announcements: payload.items,
        });

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Remove.RemoveAllAnnouncements', () => {
        const action: AlertActions = {
            type: AlertActionEnum.RemoveAllAnnouncements,
        };

        midState = Object.assign({}, initialState, {
            alerts: [
                new AlertResource(AlertTypeEnum.Success, {text: '123'}),
            ],
            announcements: [
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Foo'),
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Bar'),
            ],
        });

        nextState = Object.assign({}, midState, {
            announcements: [],
        });

        expect(ALERT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle default', () => {
        const action: AlertActions = {
            type: null,
        };

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Set.AnnouncementHasReadFulfilled', () => {
        const id = UUID.v4();
        const action: AlertActions = {
            type: AlertActionEnum.SetAnnouncementHasReadFulfilled,
            payload: id,
        };

        nextState.readAnnouncements = [id];

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Request.ReadAnnouncementsFulfilled', () => {
        const payload = ['1', '2', '3'];
        const action: AlertActions = {
            type: AlertActionEnum.RequestReadAnnouncementsFulfilled,
            payload,
        };

        nextState.readAnnouncements = payload;

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AlertActions.Add.Announcements with correct sort order', () => {
        const payload: AnnouncementListResource = {
            items: [
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Foo'),
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Error, 'Bar'),
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Success, 'Bar'),
                new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Neutral, 'Bar'),
            ],
        };
        const action: AlertActions = {
            type: AlertActionEnum.AddAnnouncements,
            payload,
        };
        const itemsSorted = [
            new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Error, 'Bar'),
            new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Warning, 'Foo'),
            new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Neutral, 'Bar'),
            new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Success, 'Bar'),
        ];

        nextState.announcements = itemsSorted;

        expect(ALERT_REDUCER(initialState, action)).toEqual(nextState);
    });
});
