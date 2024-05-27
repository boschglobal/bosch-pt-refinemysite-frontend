/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {
    CRAFT_RESOURCE_MOCK,
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFTS
} from '../../../../../../test/mocks/crafts';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectCraftActions} from '../../../../project-common/store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {
    ProjectCraftsCapture,
    ProjectCraftsCaptureComponent
} from '../../presentationals/crafts-capture/project-crafts-capture.component';
import {ProjectCraftsEditComponent} from './project-crafts-edit.component';

describe('Project Crafts Edit Component', () => {
    let fixture: ComponentFixture<ProjectCraftsEditComponent>;
    let comp: ProjectCraftsEditComponent;

    let mockedStore: any;
    const name = 'foo';
    const color = '#000000';
    const position = 1;
    const formValue: ProjectCraftsCapture = {name, color, position};

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot()
        ],
        declarations: [
            ProjectCraftsEditComponent,
            ProjectCraftsCaptureComponent
        ],
        providers: [
            UntypedFormBuilder,
            ProjectCraftQueries,
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
                            projectCraftSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
                                },
                                items: [MOCK_PROJECT_CRAFTS]
                            },
                        },
                        masterDataModule: {
                            craftSlice: {
                                used: true,
                                list: {
                                    en: [CRAFT_RESOURCE_MOCK],
                                    de: [],
                                    es: [],
                                },
                                requestStatus: RequestStatusEnum.success
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
        fixture = TestBed.createComponent(ProjectCraftsEditComponent);
        comp = fixture.componentInstance;
        mockedStore = fixture.debugElement.injector.get(Store) as any;

        comp.craft = MOCK_PROJECT_CRAFT_A;
    });

    afterAll(() => comp.ngOnDestroy());

    it('should emit onCancel when handleCancel is triggered', () => {
        comp.projectCraftsCapture.ngOnInit();

        spyOn(comp.onCancel, 'emit');
        spyOn(comp.projectCraftsCapture, 'resetForm');
        comp.handleCancel();

        expect(comp.onCancel.emit).toHaveBeenCalled();
        expect(comp.projectCraftsCapture.resetForm).toHaveBeenCalled();
    });

    it('should extract default values from craft resource', () => {
        comp.craft = MOCK_PROJECT_CRAFT_A;
        expect(comp.defaultValues.name).toBe(MOCK_PROJECT_CRAFT_A.name);
        expect(comp.defaultValues.color).toBe(MOCK_PROJECT_CRAFT_A.color);
    });

    it('should dispatch update action with right payload when handleSubmit is called', () => {
        spyOn(mockedStore, 'dispatch').and.callThrough();
        const expectedAction = new ProjectCraftActions.Update.One({
            saveProjectCraft: {name, color, position},
            projectCraftId: MOCK_PROJECT_CRAFT_A.id,
            craftVersion: MOCK_PROJECT_CRAFT_A.version,
        });

        comp.craft = MOCK_PROJECT_CRAFT_A;
        comp.handleSubmit(formValue);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set isSubmitting to false and emit onClose when request status has success', waitForAsync(() => {
        const craftReset = new ProjectCraftActions.Update.OneReset();

        spyOn(mockedStore, 'dispatch').and.callThrough();
        mockedStore._value.projectModule.projectCraftSlice.currentItem.requestStatus = RequestStatusEnum.success;

        comp.projectCraftsCapture.defaultValues = formValue;
        comp.ngOnInit();

        expect(comp.isSubmitting).toBe(false);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(craftReset);
    }));

    it('should set isSubmitting to false and emit onClose when request status has progress', waitForAsync(() => {
        const craftReset = new ProjectCraftActions.Update.OneReset();

        spyOn(mockedStore, 'dispatch').and.callThrough();
        mockedStore._value.projectModule.projectCraftSlice.currentItem.requestStatus = RequestStatusEnum.progress;

        comp.projectCraftsCapture.defaultValues = formValue;
        comp.ngOnInit();

        expect(comp.isSubmitting).toBe(true);
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(craftReset);
    }));
});
