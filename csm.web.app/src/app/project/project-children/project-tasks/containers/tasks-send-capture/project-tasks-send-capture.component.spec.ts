/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    Store,
    StoreModule
} from '@ngrx/store';

import {MockStore} from '../../../../../../test/mocks/store';
import {REDUCER} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {MiscModule} from '../../../../../shared/misc/misc.module';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {ProjectTasksSendCaptureComponent} from './project-tasks-send-capture.component';

describe('Project Tasks Send Draft Tab', () => {
    let fixture: ComponentFixture<ProjectTasksSendCaptureComponent>;
    let comp: ProjectTasksSendCaptureComponent;
    let mockedStore: any;

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            MiscModule,
            StoreModule.forRoot(REDUCER),
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectTasksSendCaptureComponent,
        ],
        providers: [
            ProjectTaskQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectTaskSlice: {
                                sendList: new AbstractSelectionList(),
                            },
                        },
                    }),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksSendCaptureComponent);
        comp = fixture.componentInstance;
        mockedStore = fixture.debugElement.injector.get(Store) as any;
        fixture.detectChanges();
    });

    it('should emit event onClose when is cancelled', () => {
        spyOn(comp.onCancel, 'emit');
        comp.handleCancel();
        expect(comp.onCancel.emit).toHaveBeenCalled();
    });

    it('should set isSubmit to false on handleCaptureState when there is Request status success', () => {
        mockedStore._value.projectModule.projectTaskSlice.sendList.requestStatus = RequestStatusEnum.success;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeFalsy();
    });

    it('should set isSubmit to true on handleCaptureState when there is Request status progress', () => {
        mockedStore._value.projectModule.projectTaskSlice.sendList.requestStatus = RequestStatusEnum.progress;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeTruthy();
    });

    it('should set isSubmit to false on handleCaptureState when there is Request status error', () => {
        mockedStore._value.projectModule.projectTaskSlice.sendList.requestStatus = RequestStatusEnum.error;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeFalsy();
    });

    it('should dispatch SendSelecting on isSelecting true', () => {
        const taskSendSelecting = new ProjectTaskActions.Set.SendSelecting(true);
        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.isSelecting = true;
        expect(mockedStore.dispatch).toHaveBeenCalledWith(taskSendSelecting);
    });

    it('should not dispatch SendSelecting on isSelecting false', () => {
        const taskSendSelecting = new ProjectTaskActions.Set.SendSelecting(true);
        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.isSelecting = false;
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(taskSendSelecting);
    });

    it('should dispatch SendAll if onSubmitForm is called', () => {
        comp.selectedTasks = ['testID1'];
        const taskSendAll = new ProjectTaskActions.Send.All(comp.selectedTasks);
        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.onSubmitForm();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(taskSendAll);
    });
});
