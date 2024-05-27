/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {InjectionToken} from '@angular/core';
import {
    ActionReducerMap,
    combineReducers
} from '@ngrx/store';

import {ALERT_REDUCER} from './shared/alert/store/alert.reducer';
import {ALERT_SLICE_INITIAL_STATE} from './shared/alert/store/alert.initial-state';
import {AlertSlice} from './shared/alert/store/alert.slice';
import {COMPANY_REDUCER} from './company/company-common/store/company.reducer';
import {
    COMPANY_SLICE_INITIAL_STATE,
    CompanySlice
} from './company/company-common/store/company.slice';
import {EMPLOYABLE_USER_REDUCER} from './user/store/employable-user/employable-user.reducer';
import {EMPLOYABLE_USER_SLICE_INITIAL_STATE} from './user/store/employable-user/employable-user.initial-state';
import {EMPLOYEE_REDUCER} from './employee/employee-common/store/employee.reducer';
import {
    EMPLOYEE_SLICE_INITIAL_STATE,
    EmployeeSlice
} from './employee/employee-common/store/employee.slice';
import {EmployableUserSlice} from './user/store/employable-user/employable-user.slice';
import {FEATURE_REDUCER} from './feature/feature-common/store/feature.reducer';
import {
    FEATURE_TOGGLE_SLICE_INITIAL_STATE,
    FeatureToggleSlice
} from './feature-toggle/feature-toggle-common/store/feature-toggle.slice';
import {FEATURE_TOGGLE_REDUCER} from './feature-toggle/feature-toggle-common/store/feature-toggle.reducer';
import {
    FEATURE_SLICE_INITIAL_STATE,
    FeatureSlice
} from './feature/feature-common/store/feature.slice';
import {PROJECT_REDUCER} from './project/project-common/store/project.reducer';
import {PROJECT_SLICE_INITIAL_STATE} from './project/project-common/store/project.initial-state';
import {ProjectSlice} from './project/project-common/store/project.slice';
import {USER_REDUCER} from './user/store/user/user.reducer';
import {USER_SLICE_INITIAL_STATE} from './user/store/user/user.initial-state';
import {UserSlice} from './user/store/user/user.slice';

export interface State {
    alertSlice: AlertSlice;
    companySlice: CompanySlice;
    employableUserSlice: EmployableUserSlice;
    employeeSlice: EmployeeSlice;
    featureSlice: FeatureSlice;
    featureToggleSlice: FeatureToggleSlice;
    projectSlice: ProjectSlice;
    userSlice: UserSlice;
}

export const INITIAL_STATE: State = {
    alertSlice: ALERT_SLICE_INITIAL_STATE,
    companySlice: COMPANY_SLICE_INITIAL_STATE,
    employableUserSlice: EMPLOYABLE_USER_SLICE_INITIAL_STATE,
    employeeSlice: EMPLOYEE_SLICE_INITIAL_STATE,
    featureSlice: FEATURE_SLICE_INITIAL_STATE,
    featureToggleSlice: FEATURE_TOGGLE_SLICE_INITIAL_STATE,
    projectSlice: PROJECT_SLICE_INITIAL_STATE,
    userSlice: USER_SLICE_INITIAL_STATE,
};

export const REDUCER: ActionReducerMap<State> = {
    alertSlice: ALERT_REDUCER,
    companySlice: COMPANY_REDUCER,
    employableUserSlice: EMPLOYABLE_USER_REDUCER,
    employeeSlice: EMPLOYEE_REDUCER,
    featureSlice: FEATURE_REDUCER,
    featureToggleSlice: FEATURE_TOGGLE_REDUCER,
    projectSlice: PROJECT_REDUCER,
    userSlice: USER_REDUCER,
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
        useFactory: getReducers
    }
];
