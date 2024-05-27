/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {UntypedFormBuilder} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREAS
} from '../../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {SaveWorkareaResource} from '../../../../project-common/api/workareas/resources/save-workarea.resource';
import {
    UpdateWorkareaPayload,
    WorkareaActions
} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {
    ProjectWorkareasCapture,
    ProjectWorkareasCaptureComponent
} from '../../presentationals/workareas-capture/project-workareas-capture.component';
import {ProjectWorkareasEditComponent} from './project-workareas-edit.component';

describe('Project WorkAreas Edit Component', () => {
    let fixture: ComponentFixture<ProjectWorkareasEditComponent>;
    let comp: ProjectWorkareasEditComponent;
    let mockedStore: any;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            UIModule
        ],
        declarations: [
            ProjectWorkareasEditComponent,
            ProjectWorkareasCaptureComponent
        ],
        providers: [
            UntypedFormBuilder,
            WorkareaQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                items: [MOCK_PROJECT_1],
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
                                }
                            },
                            workareaSlice: {
                                items: MOCK_WORKAREAS,
                                list: {
                                    ids: [
                                        MOCK_WORKAREA_A.id,
                                        MOCK_WORKAREA_B.id
                                    ]
                                },
                                currentItem: {
                                    requestStatus: RequestStatusEnum.empty
                                }
                            }
                        }
                    }
                )
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
        fixture = TestBed.createComponent(ProjectWorkareasEditComponent);
        comp = fixture.componentInstance;
        mockedStore = fixture.debugElement.injector.get(Store) as any;
    });

    beforeEach(() => comp.ngOnInit());

    afterAll(() => comp.ngOnDestroy());

    it('should emit onCancel when handleCancel is triggered', () => {
        comp.projectWorkareasCapture.ngOnInit();

        spyOn(comp.onCancel, 'emit');
        comp.handleCancel();

        expect(comp.onCancel.emit).toHaveBeenCalled();
    });

    it('should extract default values from workarea resource', () => {
        comp.workarea = MOCK_WORKAREA_A;
        expect(comp.defaultValues.name).toBe(MOCK_WORKAREA_A.name);
        expect(comp.defaultValues.position).toBe(MOCK_WORKAREA_A.position);
    });

    it('should set isSubmitting to false and emit onClose when request status has success', waitForAsync(() => {
        const workareaReset = new WorkareaActions.Update.OneReset();

        spyOn(mockedStore, 'dispatch').and.callThrough();
        mockedStore._value.projectModule.workareaSlice.currentItem.requestStatus = RequestStatusEnum.success;

        comp.workarea = MOCK_WORKAREA_A;
        comp.ngOnInit();

        expect(comp.isSubmitting).toBe(false);
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(workareaReset);
    }));

    it('should trigger onSubmit emit when form is submitted', () => {
        const saveWorkareaResource: SaveWorkareaResource = {
            name: 'Foo',
            position: 2,
            version: 1
        };
        const updateWorkareaPayload: UpdateWorkareaPayload = {
            saveWorkarea: saveWorkareaResource,
            workareaId: MOCK_WORKAREA_A.id
        };
        const workareaUpdate = new WorkareaActions.Update.One(updateWorkareaPayload);
        const projectWorkareasCaptureValue: ProjectWorkareasCapture = {
            name: 'Foo',
            position: 2
        };

        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.workarea = MOCK_WORKAREA_A;
        comp.ngOnInit();
        comp.handleSubmit(projectWorkareasCaptureValue);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(workareaUpdate);
    });
});
