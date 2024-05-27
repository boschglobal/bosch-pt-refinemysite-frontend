/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    instance,
    mock
} from 'ts-mockito';

import {FeatureToggleHelper} from '../../../../../shared/misc/helpers/feature-toggle.helper';
import {NavigationTabsRoutes} from '../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';
import {ProjectSettingsComponent} from './project-settings.component';

describe('Project Settings Component', () => {
    let component: ProjectSettingsComponent;
    let fixture: ComponentFixture<ProjectSettingsComponent>;

    const featureToggleHelper: FeatureToggleHelper = mock(FeatureToggleHelper);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: FeatureToggleHelper,
                useFactory: () => instance(featureToggleHelper),
            },
        ],
        declarations: [ProjectSettingsComponent],
    };

    const baseRoutes: NavigationTabsRoutes[] = [
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectSettingsComponent);
        component = fixture.componentInstance;
    });

    it('should set routes with the correct project settings routes', () => {
        expect(component.routes).toEqual(baseRoutes);
    });
});
