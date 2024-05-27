/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {CanDeactivateCompanyDetailsGuard} from './guards/can-deactivate-company-detais.guard';
import {CompanyComponent} from '../company.component';
import {CompanyDetailComponent} from '../company-children/company-detail/company-detail.component';
import {CompanyDetailFeaturesComponent} from '../company-children/company-detail/company-detail-features/company-detail-features.component';
import {CompanyDetailGeneralComponent} from '../company-children/company-detail/company-detail-general/company-detail-general.component';
import {CompanyListComponent} from '../company-children/company-list/company-list.component';
import {CompanyListResolverGuard} from './resolvers/company-list-resolver.guard';
import {EMPLOYEE_ROUTES} from '../../employee/employee-routing/employee-routing.routes';

export const ROUTE_PARAM_COMPANY_ID = 'userId';
export const COMPANY_ROUTE_PATHS: any = {
    companies: 'companies',
    companyId: `:${ROUTE_PARAM_COMPANY_ID}`
};

export const COMPANY_ROUTES: Routes = [
    {
        path: `${COMPANY_ROUTE_PATHS.companies}`,
        component: CompanyComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: CompanyListComponent,
            },
            {
                path: `:id`,
                component: CompanyDetailComponent,
                canActivate: [CompanyListResolverGuard],
                canDeactivate: [CanDeactivateCompanyDetailsGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'detail'
                    },
                    {
                        path: 'detail',
                        component: CompanyDetailGeneralComponent
                    },
                    {
                        path: 'features',
                        component: CompanyDetailFeaturesComponent
                    },
                    ...EMPLOYEE_ROUTES
                ]
            }
        ]
    },
];

