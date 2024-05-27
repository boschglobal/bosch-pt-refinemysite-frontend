/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {InjectionToken} from '@angular/core';
import {
    ActionReducerMap,
    combineReducers
} from '@ngrx/store';

import {PROJECT_MODULE_INITIAL_STATE} from './project/project-common/store/project-module.initial-state';
import {PROJECT_MODULE_REDUCER} from './project/project-common/store/project-module.reducer';
import {ProjectModuleSlice} from './project/project-common/store/project-module.slice';
import {ALERT_SLICE_INITIAL_STATE} from './shared/alert/store/alert.initial-state';
import {ALERT_REDUCER} from './shared/alert/store/alert.reducer';
import {AlertSlice} from './shared/alert/store/alert.slice';
import {JOB_SLICE_INITIAL_STATE} from './shared/jobs/store/job.initial-state';
import {JOB_REDUCER} from './shared/jobs/store/job.reducer';
import {JobSlice} from './shared/jobs/store/job.slice';
import {MASTER_DATA_MODULE_INITIAL_STATE} from './shared/master-data/store/master-data-module.initial-state';
import {MASTER_DATA_MODULE_REDUCER} from './shared/master-data/store/master-data-module.reducer';
import {MasterDataModuleSlice} from './shared/master-data/store/master-data-module.slice';
import {NOTIFICATION_SLICE_INITIAL_STATE} from './shared/notification/store/notification.initial-state';
import {NOTIFICATION_REDUCER} from './shared/notification/store/notification.reducer';
import {NotificationSlice} from './shared/notification/store/notification.slice';
import {REALTIME_SLICE_INITIAL_STATE} from './shared/realtime/store/realtime.initial-state';
import {REALTIME_REDUCER} from './shared/realtime/store/realtime.reducer';
import {RealtimeSlice} from './shared/realtime/store/realtime.slice';
import {USER_MODULE_INITIAL_STATE} from './user/store/user-module.initial-state';
import {USER_MODULE_REDUCER} from './user/store/user-module.reducer';
import {UserModuleSlice} from './user/store/user-module.slice';

export interface State {
    projectModule: ProjectModuleSlice;
    masterDataModule: MasterDataModuleSlice;
    userModule: UserModuleSlice;
    alertSlice: AlertSlice;
    realtimeSlice: RealtimeSlice;
    notificationSlice: NotificationSlice;
    jobSlice: JobSlice;
}

export const INITIAL_STATE = {
    projectModule: PROJECT_MODULE_INITIAL_STATE,
    masterDataModule: MASTER_DATA_MODULE_INITIAL_STATE,
    userModule: USER_MODULE_INITIAL_STATE,
    alertSlice: ALERT_SLICE_INITIAL_STATE,
    realtimeSlice: REALTIME_SLICE_INITIAL_STATE,
    notificationSlice: NOTIFICATION_SLICE_INITIAL_STATE,
    jobSlice: JOB_SLICE_INITIAL_STATE,
};

export const REDUCER: ActionReducerMap<State> = {
    projectModule: PROJECT_MODULE_REDUCER,
    masterDataModule: MASTER_DATA_MODULE_REDUCER,
    userModule: USER_MODULE_REDUCER,
    alertSlice: ALERT_REDUCER,
    realtimeSlice: REALTIME_REDUCER,
    notificationSlice: NOTIFICATION_REDUCER,
    jobSlice: JOB_REDUCER,
};

export const reducers = combineReducers(REDUCER, INITIAL_STATE);

export const reducerToken: InjectionToken<ActionReducerMap<State>> =
    new InjectionToken<ActionReducerMap<State>>('Reducers');

export function getReducers() {
    return REDUCER;
}

export const reducerProvider = [
    {
        provide: reducerToken,
        useFactory: getReducers,
    },
];
