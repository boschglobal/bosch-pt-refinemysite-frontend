/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {MOCK_PROJECT_3} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {State} from '../../../../app.reducers';
import {BlobService} from '../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectOverviewCardComponent} from './project-overview-card.component';

describe('Project Overview Card Component', () => {
    let fixture: ComponentFixture<ProjectOverviewCardComponent>;
    let comp: ProjectOverviewCardComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let router: Router;
    let store: Store<State>;

    const project: ProjectResource = MOCK_PROJECT_3;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [ProjectOverviewCardComponent],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot()
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: Router,
                useClass: RouterStub
            },
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectOverviewCardComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.project = project;

        fixture.detectChanges();

        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
    });

    const querySelector = (selector: string): string => el.querySelector(selector).textContent;

    it('should render the amount of critical topics', () => {
        const expectedCriticalTopics: number = project._embedded.statistics.criticalTopics;
        const dataAutomationCritical = `[data-automation="project-overview-card-critical-topics-${project.id}"]`;

        expect(querySelector(dataAutomationCritical)).toBeCloseTo(expectedCriticalTopics);
    });

    it('should render the title', () => {
        const expectedTitle: string = project.title;
        const dataAutomationTitle = `[data-automation="project-overview-card-title-${project.id}"]`;

        expect(querySelector(dataAutomationTitle)).toContain(expectedTitle);
    });

    it('should render the chart', () => {
        const dataAutomationTitle = `[data-automation="project-overview-card-chart-${project.id}"]`;

        expect(querySelector(dataAutomationTitle)).toBeDefined();
    });

    it('should set critical filter and navigate when handleSetCriticalTopicFilter is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.topicCriticality = ['CRITICAL'];
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(comp.projectOverviewModel.id);

        comp.handleSetCriticalTopicFilter();

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should navigate when handleNavigateProjectDashboard is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();

        const url = ProjectUrlRetriever.getProjectUrl(comp.projectOverviewModel.id);

        comp.handleNavigateProjectDashboard();

        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should retrieve appropriated wording for amount of topics', () => {
        const criticalTopics = Object.assign({}, comp.projectOverviewModel.criticalTopics);
        comp.projectOverviewModel.criticalTopics = 1;
        fixture.detectChanges();

        expect(comp.getTopicLabelKey()).toBe('Generic_CriticalTopic');

        comp.projectOverviewModel.criticalTopics = 2;
        fixture.detectChanges();

        expect(comp.getTopicLabelKey()).toBe('Generic_CriticalTopics');

        comp.projectOverviewModel.criticalTopics = criticalTopics;
    });
});
