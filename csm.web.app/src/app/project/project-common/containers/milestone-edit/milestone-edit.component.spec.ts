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
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_CRAFT_FORM_DATA
} from '../../../../../test/mocks/milestones';
import {MockStore} from '../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {SaveMilestoneResource} from '../../api/milestones/resources/save-milestone.resource';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneEditComponent} from './milestone-edit.component';

describe('Milestone Edit Component', () => {
    let comp: MilestoneEditComponent;
    let fixture: ComponentFixture<MilestoneEditComponent>;
    let store: any;

    const milestoneQueriesMock: MilestoneQueries = mock(MilestoneQueries);
    const focus = 'location';

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            MilestoneEditComponent,
        ],
        providers: [
            {
                provide: MilestoneQueries,
                useFactory: () => instance(milestoneQueriesMock),
            },
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        milestoneId: MOCK_MILESTONE_CRAFT.id,
                        focus,
                    }
                }
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            },
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneEditComponent);
        comp = fixture.componentInstance;

        store = TestBed.inject(Store);

        when(milestoneQueriesMock.observeMilestoneById(MOCK_MILESTONE_CRAFT.id)).thenReturn(of(MOCK_MILESTONE_CRAFT));
        when(milestoneQueriesMock.observeCurrentMilestoneRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        fixture.detectChanges();
        comp.milestoneCapture = jasmine.createSpyObj('MilestoneCaptureComponent', ['resetForm']);
        comp.ngOnInit();
    });

    it('should dispatch a MilestoneActions.Update.One action when calling handleSubmit', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const {id, project, version} = MOCK_MILESTONE_CRAFT;
        const expectedResult = new MilestoneActions.Update.One(id, SaveMilestoneResource.fromFormData(project.id, MOCK_MILESTONE_CRAFT_FORM_DATA), version);
        comp.handleSubmit(MOCK_MILESTONE_CRAFT_FORM_DATA);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch a MilestoneActions.Update.OneReset action when calling handleCancel', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const expectedResult = new MilestoneActions.Update.OneReset();
        comp.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should reset form when calling handleCancel', () => {
        comp.handleCancel();

        expect(comp.milestoneCapture.resetForm).toHaveBeenCalled();
    });

    it('should emit onClose when calling handleCancel', () => {
        spyOn(comp.onClose, 'emit').and.callThrough();
        comp.handleCancel();

        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should set isLoading to TRUE when capture is submitting', () => {
        when(milestoneQueriesMock.observeCurrentMilestoneRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.handleSubmit(MOCK_MILESTONE_CRAFT_FORM_DATA);
        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to FALSE after capture finished submitting', () => {
        when(milestoneQueriesMock.observeCurrentMilestoneRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should call handleCancel after form was submitted successfully', () => {
        spyOn(comp, 'handleCancel').and.callThrough();
        when(milestoneQueriesMock.observeCurrentMilestoneRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.handleSubmit(MOCK_MILESTONE_CRAFT_FORM_DATA);
        comp.ngOnInit();

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should set defaultValues with latest information from store', () => {
        const expectedResult = MOCK_MILESTONE_CRAFT;

        when(milestoneQueriesMock.observeMilestoneById(MOCK_MILESTONE_CRAFT.id)).thenReturn(of(MOCK_MILESTONE_CRAFT));
        comp.ngOnInit();

        expect(comp.defaultValues).toEqual(expectedResult);
    });

    it('should set focus defined by modal data', () => {
        expect(comp.focus).toEqual(focus);
    });
});
