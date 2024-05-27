/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
import {of} from 'rxjs';

import {FORM_DEBOUNCE_TIME} from '../../../../../../test/constants';
import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_TASK_RESOURCE} from '../../../../../../test/mocks/tasks';
import {REDUCER} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectParticipantsCaptureComponent} from './project-participants-capture.component';

describe('Project Participants Capture Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsCaptureComponent>;
    let comp: ProjectParticipantsCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: any;

    let mockedStore: any;
    const dataAutomationSelectorCancel = '[data-automation="cancel-invite"]';

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
            StoreModule.forRoot(REDUCER),
            EffectsModule.forRoot([]),
            ReactiveFormsModule,
        ],
        declarations: [
            ProjectParticipantsCaptureComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: 'projectId'
                                }]
                            }
                        }
                    },
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    snapshot: {
                        parent: {
                            params: 'name',
                            paramMap: {
                                get: () => 123
                            }
                        }
                    }
                }
            },
            HttpClient,
            {
                provide: Router,
                useValue: RouterModule
            },
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
                            projectParticipantSlice: {
                                currentItem: {
                                    id: MOCK_PARTICIPANT.id,
                                    requestStatus: RequestStatusEnum.empty
                                }
                            },
                            projectTaskSlice: {
                                currentItem: {
                                    id: MOCK_TASK_RESOURCE.id
                                },
                                items: [MOCK_TASK_RESOURCE]
                            }
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantsCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        mockedStore = fixture.debugElement.injector.get(Store) as any;

        store = TestBed.inject(Store);

        fixture.detectChanges();
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should set participants capture form after ngOnInit()', () => {
        comp.participantsCaptureForm = null;
        comp.ngOnInit();
        fixture.detectChanges();
        expect(comp.participantsCaptureForm).toBeDefined();
    });

    it('should emit onClose when cancel button is clicked', () => {
        spyOn(comp.onClose, 'emit');
        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should return isFormValid() false when email length is greater than 254', () => {
        const email = `fasfijijgpijegpojdspgojsdpogjpdogjposdjgposdjgposdjgopsdjgposdjgjsdgpojsdgpojdsopgjsdpojgpdosjgop
        dsjgpodsjgpodsjgpodsjgpodsjgopdsjgpodsjgpopdsojgpodsjgpodsjgpoisdfjagpiojgijgopierjgpioearjgiopejrgpiojgraepijgp
        porjagpoerjagpoajegrpojeragpojeragpojeragpojegrapojergaopjgropaerg`;
        comp.participantsCaptureForm.controls['email'].setValue(email);
        expect(comp.isFormValid()).toBe(false);
    });

    it('should return isFormValid() false when role not set', () => {
        comp.participantsCaptureForm.controls['email'].setValue('abc');
        comp.participantsCaptureForm.controls['role'].setValue('');
        expect(comp.isFormValid()).toBe(false);
    });

    it('should return isFormValid() true when email length is less than 254', () => {
        const email = 'abc';
        comp.participantsCaptureForm.controls['email'].setValue(email);
        comp.participantsCaptureForm.controls['role'].setValue('FM');
        expect(comp.isFormValid()).toBe(true);
    });

    it('should submit form when form is valid', fakeAsync(() => {
        const email = 'abc@abc.pt';
        comp.participantsCaptureForm.controls['email'].setValue(email);
        comp.participantsCaptureForm.controls['role'].setValue('FM');
        fixture.detectChanges();
        tick(FORM_DEBOUNCE_TIME);
        expect(comp.isFormValid()).toBe(true);
    }));

    it('should not submit form when form is invalid', fakeAsync(() => {
        const email = '';
        comp.participantsCaptureForm.controls['email'].setValue(email);
        comp.participantsCaptureForm.controls['role'].setValue('FM');
        fixture.detectChanges();
        tick(FORM_DEBOUNCE_TIME);
        expect(comp.isFormValid()).toBe(false);
    }));

    it('should set isSubmitting to false and emit onClose when request status has success', waitForAsync(() => {
        spyOn(comp.onClose, 'emit').and.callThrough();
        mockedStore._value.projectModule.projectParticipantSlice.currentItem.requestStatus = RequestStatusEnum.success;
        comp.ngOnInit();
        expect(comp.isSubmitting).toBe(false);
        expect(comp.onClose.emit).toHaveBeenCalled();
    }));

    it('should set isSubmitting to true when request status is in progress', waitForAsync(() => {
        mockedStore._value.projectModule.projectParticipantSlice.currentItem.requestStatus = RequestStatusEnum.progress;
        comp.ngOnInit();
        expect(comp.isSubmitting).toBe(true);
    }));

    it('should set isSubmitting to false when request status has error', waitForAsync(() => {
        mockedStore._value.projectModule.projectParticipantSlice.currentItem.requestStatus = RequestStatusEnum.error;
        comp.ngOnInit();
        expect(comp.isSubmitting).toBe(false);
    }));

    it('should cancel onSubmitForm() when form is invalid', () => {
        const email = ' ';
        spyOn(comp, 'isFormValid').and.callThrough();
        comp.participantsCaptureForm.controls['email'].setValue(email);
        fixture.detectChanges();
        comp.onSubmitForm();
        expect(comp.isFormValid()).not.toBeTruthy();
    });

    it('should call onSubmitForm when form is valid', () => {
        spyOn(comp, 'onSubmitForm').and.callThrough();
        comp.participantsCaptureForm.controls['email'].setValue('asd@asd.com');
        comp.participantsCaptureForm.controls['role'].setValue('CSM');
        fixture.detectChanges();

        comp.onSubmitForm();
        expect(comp.isFormValid()).toBeTruthy();
    });

    it('should call setFocus and focus input', () => {
        spyOn(comp, 'setFocus').and.callThrough();

        fixture.detectChanges();
        comp.setFocus();

        expect(comp.emailInput.input.nativeElement.focus).toBeTruthy();
    });

    it('should dispatch ProjectParticipantActions.Request.Page action when capture state is successful', () => {
        const expectedAction = new ProjectParticipantActions.Request.Page();

        spyOn(store, 'dispatch').and.callThrough();
        mockedStore._value.projectModule.projectParticipantSlice.currentItem.requestStatus = RequestStatusEnum.success;
        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
