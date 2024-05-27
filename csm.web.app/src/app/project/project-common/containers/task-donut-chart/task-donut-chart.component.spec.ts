/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

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
import {TranslateService} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';

import {MockStore} from '../../../../../test/mocks/store';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {TaskDonutChartComponent} from './task-donut-chart.component';
import {TaskDonutChartModel} from './task-donut-chart.model';

describe('TaskDonutChartComponent', () => {
    let component: TaskDonutChartComponent;
    let fixture: ComponentFixture<TaskDonutChartComponent>;
    let router: Router;
    let store: Store<State>;

    const MOCK_FILLED_EMPTY_SLICE: TaskDonutChartModel = {
        projectId: '123',
        donutChartSlices: [
            {
                id: 'CLOSED',
                label: 'Done',
                value: 1000,
                color: '#70bf54'
            },
            {
                id: '2',
                label: 'In progress',
                value: 0,
                color: '#008ecf'
            },
            {
                id: '3',
                label: 'Open',
                value: 0,
                color: '#bfc0c2',
                hoverOpacity: .4
            },
            {
                id: '4',
                label: 'Draft',
                value: 0,
                color: '#dfdfe0'
            }
        ]
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule
        ],
        declarations: [TaskDonutChartComponent],
        providers: [
            {
                provide: Router,
                useClass: RouterStub
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDonutChartComponent);
        component = fixture.componentInstance;
        component.taskChart = cloneDeep(MOCK_FILLED_EMPTY_SLICE);
        fixture.detectChanges();

        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
    });

    it('should plural label when there are more then 1 tasks', () => {
        expect(component.getTaskLabelKey()).toBe('Generic_Tasks');
    });

    it('should plural label when there are 0 tasks', () => {
        component.taskChart.donutChartSlices[0].value = 0;
        expect(component.getTaskLabelKey()).toBe('Generic_Tasks');
    });

    it('should singular label when there are only 1 task', () => {
        component.taskChart.donutChartSlices[0].value = 1;
        expect(component.getTaskLabelKey()).toBe('Generic_Task');
    });

    it('should set status filter and navigate when handleSetStatusFilter is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.status = [TaskStatusEnum.CLOSED];
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(component.taskChart.projectId);

        component.handleSetStatusFilter(MOCK_FILLED_EMPTY_SLICE.donutChartSlices[0]);

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should clear status filter and navigate when handleClickCenter is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(component.taskChart.projectId);

        component.handleClickCenter();

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });
});
