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
    Router,
    RouterModule
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
import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREAS
} from '../../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {REDUCER} from '../../../../../app.reducers';
import {MasterDataModule} from '../../../../../shared/master-data/master-data.module';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {ProjectCompanyService} from '../../../../project-common/api/companies/project-company.service';
import {ProjectCompanyServiceMock} from '../../../../project-common/api/companies/project-company.service.mock';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectTasksCreateComponent} from './project-tasks-create.component';

describe('Project Tasks Create Component', () => {
    let fixture: ComponentFixture<ProjectTasksCreateComponent>;
    let comp: ProjectTasksCreateComponent;
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
            projectParticipantSlice: {
                currentItem: {
                    id: MOCK_PARTICIPANT.id
                },
                items: [MOCK_PARTICIPANT]
            },
            projectTaskSlice: {
                items: [],
                currentItem: {
                    requestStatus: RequestStatusEnum.empty,
                },
                permissions: {
                    canCreateProjectTask: true
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
            ProjectTasksCreateComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123})
                }
            },
            {
                provide: ProjectCompanyService,
                useClass: ProjectCompanyServiceMock
            },
            {
                provide: Store,
                useValue: new MockStore(initialState)
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub
            },
            {
                provide: Router,
                useValue: RouterModule
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksCreateComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        mockedStore = fixture.debugElement.injector.get(Store);
        fixture.detectChanges();
    });

    it('should set isLoading to false and trigger project task capture resetForm() when request status has success', () => {
        spyOn(comp.createCapture, 'resetForm').and.callThrough();
        mockedStore._value.projectModule.projectTaskSlice.currentItem.requestStatus = RequestStatusEnum.success;
        comp.isSubmitting = true;
        comp.ngOnInit();
        expect(comp.isLoading).toBeFalsy();
        expect(comp.createCapture.resetForm).toHaveBeenCalled();
    });

    it('should set isLoading to true when request status is in progress and form has been submitted', () => {
        mockedStore._value.projectModule.projectTaskSlice.currentItem.requestStatus = RequestStatusEnum.progress;
        comp.isSubmitting = true;
        comp.ngOnInit();
        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when request status has an error', waitForAsync(() => {
        mockedStore._value.projectModule.projectTaskSlice.currentItem.requestStatus = RequestStatusEnum.error;
        comp.ngOnInit();
        comp.isSubmitting = true;
        expect(comp.isLoading).toBeFalsy();
    }));

    it('should trigger handleSubmit() when task capture call onAssignAndSend()', () => {
        spyOn(comp, 'handleSubmit').and.callThrough();
        comp.createCapture.onAssignAndSend();
        expect(comp.handleSubmit).toHaveBeenCalled();
    });

    it('should trigger handleSubmit() when task capture call onSaveAsDraft()', () => {
        spyOn(comp, 'handleSubmit').and.callThrough();
        comp.createCapture.onSaveAsDraft();
        expect(comp.handleSubmit).toHaveBeenCalled();
    });

    it('should trigger onClose emit when form is cancelled', () => {
        spyOn(comp.onClose, 'emit').and.callThrough();
        comp.createCapture.handleCancel();
        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should call task capture handleCancel() when handleCancel() is called', () => {
        spyOn(comp.createCapture, 'handleCancel').and.callThrough();
        comp.handleCancel();
        expect(comp.createCapture.handleCancel).toHaveBeenCalled();
    });
});
