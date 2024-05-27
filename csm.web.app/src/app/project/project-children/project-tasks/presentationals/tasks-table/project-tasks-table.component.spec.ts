/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router,
    RouterModule
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {
    MOCK_TASK,
    MOCK_TASK_WITH_WORKAREA,
} from '../../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../../test/mocks/workareas';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {REDUCER} from '../../../../../app.reducers';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ROUTE_PARAM_TASK_ID} from '../../../../project-routing/project-route.paths';
import {ProjectTaskContentModel} from '../../containers/tasks-content/project-tasks-content.model';
import {ProjectTasksTableComponent} from './project-tasks-table.component';

describe('Project Tasks Table Component', () => {
    let fixture: ComponentFixture<ProjectTasksTableComponent>;
    let comp: ProjectTasksTableComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const clickEvent: Event = new Event('click');
    const dataAutomationWorkArea = '[data-automation="tasks-table-work-area"]';

    const mockedTaskContentModels: ProjectTaskContentModel[] = [
        ProjectTaskContentModel.fromTaskAndWorkAreaResource(MOCK_TASK_WITH_WORKAREA, MOCK_WORKAREA_B),
        ProjectTaskContentModel.fromTaskAndWorkAreaResource(MOCK_TASK),
    ];
    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="table-${area}-${field}"]`;
    const getChildElement = (parentSelector: string, childSelector: string): HTMLElement | null =>
        de.query((By.css(parentSelector))).nativeElement.querySelector(childSelector);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            EffectsModule.forRoot([]),
            StoreModule.forRoot(REDUCER),
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectTasksTableComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_TASK_ID]: 123}),
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Router,
                useValue: RouterModule,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksTableComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.tasks = mockedTaskContentModels;
        fixture.detectChanges();
    });

    it('should set settings after ngOnInit()', waitForAsync(() => {
        comp.ngOnInit();
        expect(comp.settings).toBeTruthy();
    }));

    it('should set sortable direction when name sort changes', waitForAsync(() => {
        const column = 'name';

        comp.sort = new SorterData(column, SortDirectionEnum.desc);
        expect(comp.settings.headers[0].sortable.direction).toBe(SortDirectionEnum.desc);
    }));

    it('should trigger onSortTable with the right params when company is clicked', () => {
        const field = 'company';

        comp.sort = new SorterData(field, SortDirectionEnum.desc);
        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('header', field)).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalledWith(new SorterData(field, SortDirectionEnum.asc));
    });

    it('should trigger onClickRowTable with the right params when first row is clicked', () => {
        const field = '0';
        const row = 0;

        spyOn(comp, 'onClickRowTable').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('row', field)).dispatchEvent(clickEvent);
        expect(comp.onClickRowTable).toHaveBeenCalledWith(comp.tasks[row]);
    });

    it('should render work area label when task has a work area', () => {
        const taskWithWorkAreaIndex = 0;
        const workAreaRow = getChildElement(getTableAreaFieldSelector('row', `${taskWithWorkAreaIndex}`), dataAutomationWorkArea);
        expect(workAreaRow).toBeDefined();
    });

    it('should not render work area label when task does not have a work area', () => {
        const taskWithoutWorkAreaIndex = 1;
        const workAreaRow = getChildElement(getTableAreaFieldSelector('row', `${taskWithoutWorkAreaIndex}`), dataAutomationWorkArea);
        expect(workAreaRow).toBeNull();
    });
});
