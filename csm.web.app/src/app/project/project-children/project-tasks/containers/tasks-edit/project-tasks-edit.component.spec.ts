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
    ActivatedRoute,
    Router
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {MockProjectTasksCaptureComponent} from '../../../../../../test/mocks/components/mock-project-tasks-capture.component';
import {MOCK_PROJECT_CRAFT_LIST} from '../../../../../../test/mocks/crafts';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    MOCK_CREATE_TASK_WITH_VERSIONS,
    MOCK_TASK_1,
    MOCK_TASK_RESOURCE
} from '../../../../../../test/mocks/tasks';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREAS
} from '../../../../../../test/mocks/workareas';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {REDUCER} from '../../../../../app.reducers';
import {MasterDataModule} from '../../../../../shared/master-data/master-data.module';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {ProjectCompanyService} from '../../../../project-common/api/companies/project-company.service';
import {ProjectCompanyServiceMock} from '../../../../project-common/api/companies/project-company.service.mock';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectTasksEditComponent} from './project-tasks-edit.component';

describe('Project Tasks Edit', () => {
    let fixture: ComponentFixture<ProjectTasksEditComponent>;
    let comp: ProjectTasksEditComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let mockedStore: any;

    const initialState: any = {
        projectModule: {
            projectSlice: {
                items: [MOCK_PROJECT_1],
                currentItem: {
                    id: MOCK_PROJECT_1.id
                }
            },
            projectCraftSlice: {
                items: MOCK_PROJECT_CRAFT_LIST.projectCrafts,
                lists: {
                    [MOCK_PROJECT_1.id]: {
                        ids: MOCK_PROJECT_CRAFT_LIST.projectCrafts.map((craft) => craft.id),
                        requestStatus: RequestStatusEnum.success,
                    }
                }
            },
            projectTaskSlice: {
                items: [MOCK_TASK_1],
                currentItem: {
                    id: MOCK_TASK_RESOURCE.id,
                    requestStatus: RequestStatusEnum.empty,
                }
            },
            workareaSlice: {
                items: MOCK_WORKAREAS,
                list: {
                    ids: [
                        MOCK_WORKAREA_A.id,
                        MOCK_WORKAREA_B.id
                    ],
                    _links: {
                        create: {
                            href: ''
                        }
                    }
                },
                currentItem: {
                    requestStatus: RequestStatusEnum.empty
                }
            }
        }
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            StoreModule.forRoot(REDUCER, initialState),
            EffectsModule.forRoot([]),
            MasterDataModule,
            TranslationModule,
        ],
        declarations: [
            MockProjectTasksCaptureComponent,
            ProjectTasksEditComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123})
                }
            },
            {
                provide: Router,
                useClass: RouterStub
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub
            },
            {
                provide: Store,
                useValue: new MockStore(initialState)
            },
            {
                provide: ProjectCompanyService,
                useClass: ProjectCompanyServiceMock
            },
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        taskId: MOCK_TASK_RESOURCE.id
                    }
                }
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksEditComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        mockedStore = de.injector.get(Store) as any;

        fixture.detectChanges();
    });

    it('should trigger handleUpdate()', () => {
        spyOn(comp, 'handleUpdate').and.callThrough();
        comp.handleUpdate(MOCK_CREATE_TASK_WITH_VERSIONS);
        fixture.detectChanges();

        expect(comp.handleUpdate).toHaveBeenCalled();
    });

    it('should trigger handleCancel()', () => {
        spyOn(comp.editCapture, 'handleCancel');
        mockedStore._value.projectModule.projectTaskSlice.currentItem.requestStatus = RequestStatusEnum.success;
        comp.handleUpdate(MOCK_CREATE_TASK_WITH_VERSIONS);
        comp.ngOnInit();

        expect(comp.editCapture.handleCancel).toHaveBeenCalled();
    });
});
