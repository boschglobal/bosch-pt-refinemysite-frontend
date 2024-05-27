/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AnnouncementResource} from '../api/resources/announcement.resource';
import {AlertTypeEnum} from '../enums/alert-type.enum';
import {
    AlertActionEnum,
    AlertActions
} from './alert.actions';
import {ALERT_SLICE_INITIAL_STATE} from './alert.initial-state';
import {AlertSlice} from './alert.slice';

enum AnnouncementsSortPriority {
    Success = 4,
    Neutral = 3,
    Warning = 2,
    Error = 1,
}

const announcementsPriorityMap: { [key in AlertTypeEnum]: AnnouncementsSortPriority } = {
    [AlertTypeEnum.Error]: AnnouncementsSortPriority.Error,
    [AlertTypeEnum.Warning]: AnnouncementsSortPriority.Warning,
    [AlertTypeEnum.Neutral]: AnnouncementsSortPriority.Neutral,
    [AlertTypeEnum.Success]: AnnouncementsSortPriority.Success,
};

const sortAnnouncements = (announcementList: AnnouncementResource[]): AnnouncementResource[] => {
    return [...announcementList].sort((a, b) => {
        const [firsScope, secondScope] = [a, b].map(announcement => announcementsPriorityMap[announcement.type]);

        return firsScope - secondScope;
    });
};

export function alertReducer(state = ALERT_SLICE_INITIAL_STATE, action: AlertActions): AlertSlice {
    switch (action.type) {
        case AlertActionEnum.AddAlert:
            return Object.assign({}, state,
                {alerts: [...state.alerts, action.payload]});

        case AlertActionEnum.RemoveAlert:
            return Object.assign({}, state,
                {alerts: state.alerts.filter(alert => alert.id !== action.payload)});

        case AlertActionEnum.RemoveAllAlerts:
            return Object.assign({}, state, {alerts: []});

        case AlertActionEnum.AddAnnouncements:
            return Object.assign({}, state,
                {announcements: sortAnnouncements(action.payload.items)});

        case AlertActionEnum.RequestReadAnnouncementsFulfilled:
            return Object.assign({}, state, {readAnnouncements: action.payload});

        case AlertActionEnum.SetAnnouncementHasReadFulfilled:
            return Object.assign({}, state, {readAnnouncements: [...state.readAnnouncements, action.payload]});

        case AlertActionEnum.RemoveAllAnnouncements:
            return Object.assign({}, state, {announcements: []});

        default:
            return state;
    }
}

export const ALERT_REDUCER = alertReducer;
