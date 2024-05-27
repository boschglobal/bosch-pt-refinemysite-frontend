/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {NavigationTabsRoutes} from '../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';

@Component({
    selector: 'ss-project-settings',
    templateUrl: './project-settings.component.html',
    styleUrls: ['./project-settings.component.scss'],
})
export class ProjectSettingsComponent {

    public routes: NavigationTabsRoutes[] = [
        {
            label: 'Generic_ReasonsForVariance',
            link: PROJECT_ROUTE_PATHS.settingsRfv,
        },
        {
            label: 'Generic_Constraints',
            link: PROJECT_ROUTE_PATHS.settingsConstraints,
        },
        {
            label: 'Generic_WorkingDays',
            link: PROJECT_ROUTE_PATHS.settingsWorkingDays,
        },
    ];
}
