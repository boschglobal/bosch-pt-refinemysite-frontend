/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C
} from '../../../../../test/mocks/crafts';
import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREA_C
} from '../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {SelectOptionGroup} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {CurrentProjectPermissions} from '../../store/projects/project.slice';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {MilestoneTypeOption} from '../milestone-type-options/milestone-type-options.component';
import {
    MilestoneCaptureComponent,
    MilestoneFormData
} from './milestone-capture.component';

describe('Milestone Capture Component', () => {
    let component: MilestoneCaptureComponent;
    let fixture: ComponentFixture<MilestoneCaptureComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let storeMock: Store<State>;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);
    const workareaQueriesMock: WorkareaQueries = mock(WorkareaQueries);

    const dataAutomationCreateMilestoneSelector = '[data-automation="submit"]';
    const dataAutomationCancelMilestoneSelector = '[data-automation="cancel"]';

    const currentProjectPermissions: CurrentProjectPermissions = {
        canCreateCraftMilestone: true,
        canCreateInvestorMilestone: true,
        canCreateProjectMilestone: true,
    } as CurrentProjectPermissions;
    const crafts: ProjectCraftResource[] = [
        MOCK_PROJECT_CRAFT_A,
        MOCK_PROJECT_CRAFT_B,
        MOCK_PROJECT_CRAFT_C,
    ];
    const workAreas: WorkareaResource[] = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
        MOCK_WORKAREA_C,
    ];
    const clickEvent: Event = new Event('click');

    const getTypeOption = (group: SelectOptionGroup<MilestoneTypeOption>, type: MilestoneTypeEnum) => {
        return group.options.find(option => option.value.marker.type === type);
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserAnimationsModule,
            BrowserModule,
        ],
        declarations: [
            MilestoneCaptureComponent,
        ],
        providers: [
            {
                provide: ProjectCraftQueries,
                useFactory: () => instance(projectCraftQueriesMock),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        storeMock = TestBed.inject(Store);

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(currentProjectPermissions));
        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(of(crafts));
        when(workareaQueriesMock.observeWorkareas()).thenReturn(of(workAreas));

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should set form after ngOnInit()', () => {
        fixture.detectChanges();
        expect(component.form).toBeDefined();

        component.form = null;
        component.ngOnInit();

        fixture.detectChanges();
        expect(component.form).toBeDefined();
    });

    it('should allow to create a milestone when title, type, date and location are filled', () => {
        spyOn(component, 'handleSubmit').and.callThrough();
        spyOn(component.onSubmit, 'emit').and.callThrough();

        component.mode = CaptureModeEnum.create;
        component.form.get('title').setValue('Lorem ipsum');
        component.form.get('type').setValue({});
        component.form.get('date').setValue(moment());
        component.form.get('location').setValue({});
        fixture.detectChanges();

        el.querySelector(dataAutomationCreateMilestoneSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleSubmit).toHaveBeenCalled();
        expect(component.onSubmit.emit).toHaveBeenCalledWith(component.form.value);
    });

    it('should allow to update a milestone when all fields are filled', () => {
        spyOn(component, 'handleSubmit').and.callThrough();
        spyOn(component.onSubmit, 'emit').and.callThrough();

        component.mode = CaptureModeEnum.update;
        component.defaultValues = MOCK_MILESTONE_HEADER;
        component.form.get('description').setValue('Lorem ipsum');
        fixture.detectChanges();

        el.querySelector(dataAutomationCreateMilestoneSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleSubmit).toHaveBeenCalledWith();
        expect(component.onSubmit.emit).toHaveBeenCalledWith(component.form.value);
    });

    it('should cancel and call cancel method when clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();
        spyOn(component.onCancel, 'emit').and.callThrough();

        component.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationCancelMilestoneSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleCancel).toHaveBeenCalled();
        expect(component.onCancel.emit).toHaveBeenCalled();
    });

    it('should reset form on cancel', () => {
        component.form.get('title').setValue('Lorem ipsum');
        component.form.get('type').setValue({});
        component.form.get('date').setValue(moment());
        component.form.get('location').setValue({});
        component.form.get('description').setValue('Lorem ipsum');

        component.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationCancelMilestoneSelector).dispatchEvent(clickEvent);

        expect(component.form.get('title').value).toBe('');
        expect(component.form.get('type').value).toBeNull();
        expect(component.form.get('date').value).toBeNull();
        expect(component.form.get('location').value).toBeNull();
        expect(component.form.get('description').value).toBe('');
    });

    it('should trigger setFocus from titleInput when title is empty and no focus is defined', () => {
        spyOn(component.titleInput, 'setFocus').and.callThrough();

        component.mode = CaptureModeEnum.create;
        component.ngOnInit();

        expect(component.titleInput.setFocus).toHaveBeenCalled();
    });

    it('should trigger setFocus from locationInput when focus is defined', () => {
        spyOn(component.locationInput, 'setFocus').and.callThrough();

        component.defaultValues = MOCK_MILESTONE_HEADER;
        component.mode = CaptureModeEnum.update;
        component.focus = 'location';
        component.ngOnInit();

        expect(component.locationInput.setFocus).toHaveBeenCalled();
    });

    it('should provide Investors Milestone Option when user has permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: true,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const nonCraftOptions = component.typeOptions[0];
        expect(getTypeOption(nonCraftOptions, MilestoneTypeEnum.Investor)).toBeTruthy();
    });

    it('should not provide Investors Milestone Option when user doesn\'t have permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: true,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const nonCraftOptions = component.typeOptions[0];
        expect(getTypeOption(nonCraftOptions, MilestoneTypeEnum.Investor)).toBeFalsy();
    });

    it('should provide Project Milestone Option when user has permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: true,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const nonCraftOptions = component.typeOptions[0];
        expect(getTypeOption(nonCraftOptions, MilestoneTypeEnum.Project)).toBeTruthy();
    });

    it('should not provide Project Milestone Option when user doesn\'t have permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: false,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const nonCraftOptions = component.typeOptions[0];
        expect(getTypeOption(nonCraftOptions, MilestoneTypeEnum.Project)).toBeFalsy();
    });

    it('should not provide Non Craft Milestone Option Group when user doesn\'t have permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: false,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const craftOptions = component.typeOptions[0];
        expect(component.typeOptions.length).toBe(1);
        expect(getTypeOption(craftOptions, MilestoneTypeEnum.Craft)).toBeTruthy();
    });

    it('should provide Craft Milestone Options when user has permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: true,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const craftOptions = component.typeOptions[1];
        crafts.forEach((craft, index) => {
            expect(craftOptions.options[index].value.craftId).toBe(craft.id);
        });
    });

    it('should not provide Craft Milestone Option Group when user doesn\'t have permission', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: true,
            canCreateCraftMilestone: false,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        component.ngOnInit();

        const craftOptions = component.typeOptions[1];
        expect(craftOptions).toBeFalsy();
    });

    it('should provide Location Options', () => {
        const expectedLength = workAreas.length + 2;
        const topRowOption = component.locationOptions[0];
        const noWorkAreaOption = component.locationOptions[component.locationOptions.length - 1];
        const workAreasOptions = component.locationOptions.slice(1, component.locationOptions.length - 1);

        expect(component.locationOptions.length).toBe(expectedLength);
        expect(topRowOption.value).toBe('header');
        expect(noWorkAreaOption.value).toBe('no-row');
        workAreas.forEach((workArea, index) => {
            expect(workAreasOptions[index].value).toBe(workArea.id);
        });
    });

    it('should generate right defaultValues for Header Milestone', () => {
        const milestone = MOCK_MILESTONE_HEADER;
        const {name: title, date, description} = milestone;
        const expectedValue: MilestoneFormData = {
            title,
            type: {
                marker: {
                    type: MilestoneTypeEnum.Investor,
                },
            },
            location: 'header',
            date,
            description,
        };
        component.defaultValues = milestone;

        expect(component.form.value).toEqual(expectedValue);
    });

    it('should generate right defaultValues for Workarea Milestone', () => {
        const milestone = MOCK_MILESTONE_WORKAREA;
        const {name: title, date, description, workArea} = milestone;
        const expectedValue: MilestoneFormData = {
            title,
            type: {
                marker: {
                    type: MilestoneTypeEnum.Project,
                },
            },
            location: workArea.id,
            date,
            description,
        };
        component.defaultValues = milestone;

        expect(component.form.value).toEqual(expectedValue);
    });

    it('should generate right defaultValues for Craft Milestone', () => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const {name: title, date, description, craft: {displayName, color, id}} = milestone;
        const expectedValue: MilestoneFormData = {
            title,
            type: {
                marker: {
                    type: MilestoneTypeEnum.Craft,
                    color,
                },
                craftId: id,
            },
            location: 'no-row',
            date,
            description,
        };
        component.defaultValues = milestone;

        expect(component.form.value).toEqual(expectedValue);
    });

    it('should request Working Areas when component inits', () => {
        const expectedAction = new WorkareaActions.Request.All();
        spyOn(storeMock, 'dispatch');

        component.ngOnInit();

        expect(storeMock.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should request Crafts when component inits', () => {
        const expectedAction = new ProjectCraftActions.Request.All();
        spyOn(storeMock, 'dispatch');

        component.ngOnInit();

        expect(storeMock.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should add position to each work area text', () => {
        const [,workArea] = component.locationOptions;

        expect(workArea.label).toBe(`${MOCK_WORKAREA_A.position}. ${MOCK_WORKAREA_A.name}`);
    });
});
