/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';

import {MOCK_NEW_A} from '../../../../../../../test/mocks/news';
import {MockStore} from '../../../../../../../test/mocks/store';
import {NavigationTabsComponent} from '../../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {StickyModule} from '../../../../../../shared/sticky/sticky.module';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {ROUTE_PARAM_TASK_ID} from '../../../../../project-routing/project-route.paths';
import {ProjectTaskWorkflowComponent} from './project-task-workflow.component';

describe('Project Task Workflow Component', () => {
    let fixture: ComponentFixture<ProjectTaskWorkflowComponent>;
    let comp: ProjectTaskWorkflowComponent;
    let de: DebugElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            RouterTestingModule,
            StickyModule,
            TranslateModule.forRoot()
        ],
        declarations: [
            NavigationTabsComponent,
            ProjectTaskWorkflowComponent
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        params: {[ROUTE_PARAM_TASK_ID]: MOCK_NEW_A.context.id}
                    }
                }
            },
            NewsQueries,
            {
                provide: Store,
                useValue: new MockStore({
                    projectModule: {
                        newsSlice: {
                            items: [MOCK_NEW_A]
                        }
                    }
                })
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskWorkflowComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should set hasMarker property in Activities tab when there are news', () => {
        expect(comp.routes[2].hasMarker).toBeTruthy();
    });

    it('should not set hasMarker property in other tabs then Activities tab', () => {
        expect(comp.routes[0].hasMarker).toBeFalsy();
        expect(comp.routes[1].hasMarker).toBeFalsy();
    });
});
