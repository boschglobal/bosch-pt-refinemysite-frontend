/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    DebugElement,
    NO_ERRORS_SCHEMA,
    SimpleChange,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B
} from '../../../../../test/mocks/crafts';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {CollapsibleSelectComponent} from '../../../../shared/ui/collapsible-select/collapsible-select.component';
import {InputMultipleSelectComponent} from '../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {
    MilestoneFilterCaptureComponent,
    MilestoneFilterFormData
} from './milestone-filter-capture.component';

describe('Milestone Filter Capture Component', () => {
    let component: MilestoneFilterCaptureComponent;
    let fixture: ComponentFixture<MilestoneFilterCaptureComponent>;
    let de: DebugElement;

    const craftList = [
        MOCK_PROJECT_CRAFT_A,
        MOCK_PROJECT_CRAFT_B,
    ];
    const milestoneTypes = [MilestoneTypeEnum.Investor, MilestoneTypeEnum.Project];
    const projectCraftIds = craftList.map(item => item.id);
    const projectCraftSubject: Subject<ProjectCraftResource[]> = new Subject<ProjectCraftResource[]>();

    const mockProjectCraftQueries = mock(ProjectCraftQueries);

    const dataAutomationMultiSelect = '[data-automation="input-multi-select"]';
    const query = (selector: string) => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            TranslationModule.forRoot(),
            ReactiveFormsModule,
            UIModule,
        ],
        declarations: [
            CollapsibleSelectComponent,
            InputMultipleSelectComponent,
            MilestoneFilterCaptureComponent,
        ],
        providers: [
            {
                provide: ProjectCraftQueries,
                useValue: instance(mockProjectCraftQueries),
            },
        ],
    };

    when(mockProjectCraftQueries.observeCraftsSortedByName()).thenReturn(projectCraftSubject);

    beforeEach(async () => {
        await TestBed.configureTestingModule(moduleDef)
            .compileComponents();

        fixture = TestBed.createComponent(MilestoneFilterCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        component.ngOnInit();

        fixture.detectChanges();
    });

    it('should have a multi-select element', () => {
        const multiSelect = query(dataAutomationMultiSelect);

        expect(multiSelect.nativeElement).toBeTruthy();
    });

    it('should provide craft options to the multi-select element', () => {
        const NUM_MILESTONE_OPTIONS = 2;

        projectCraftSubject.next(craftList);

        expect(component.options.length).toEqual(craftList.length + NUM_MILESTONE_OPTIONS);
        expect(component.options[0].id).toEqual(MilestoneTypeEnum.Investor);
        expect(component.options[1].id).toEqual(MilestoneTypeEnum.Project);
        expect(component.options[2].id).toEqual(craftList[0].id);
        expect(component.options[3].id).toEqual(craftList[1].id);
    });

    it('should set the selectedIds which is provided to the MultiSelect control when providing a value with form data', () => {
        const expectedSelectedIds = [
            ...milestoneTypes,
            ...projectCraftIds,
        ];
        component.defaultValues = {
            types: milestoneTypes,
            projectCraftIds,
        };

        expect(component.form.controls.selectedIds.value).toEqual(expectedSelectedIds);
    });

    it('should set the collapsibleSelectValue to true when every option is selected', () => {
        projectCraftSubject.next(craftList);

        component.form.controls.selectedIds.setValue([
            ...milestoneTypes,
            ...projectCraftIds,
        ]);

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should set the collapsibleSelectValue to true when no option is selected', () => {
        component.form.controls.selectedIds.setValue([]);

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should set the collapsibleSelectValue to true when at least one option is selected', () => {
        component.form.controls.selectedIds.setValue([MilestoneTypeEnum.Investor]);

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should unset all the form values accordingly when handleSelect is called with false', () => {
        component.handleSelect(false);

        expect(component.form.controls.selectedIds.value).toEqual([]);
        expect(component.collapsibleSelectValue).toEqual(false);
    });

    it('should set all the form values accordingly when handleSelect is called with true', () => {
        component.handleSelect(true);

        expect(component.form.controls.selectedIds.value).toEqual([]);
        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should calculate the form data interface via getFormValue and add MileStoneTypeEnum.Craft', () => {
        const value = {
            types: [...milestoneTypes],
            projectCraftIds: [...projectCraftIds],
        };
        const expectedValue = {
            types: [...value.types, MilestoneTypeEnum.Craft],
            projectCraftIds: value.projectCraftIds,
        };
        component.defaultValues = value;

        expect(component.getFormValue()).toEqual(expectedValue);
    });

    it('should return an empty form data interface via getFormValue when an empty value is provided', () => {
        const value = {
            types: [],
        };
        component.defaultValues = value;

        expect(component.getFormValue()).toEqual(value);
    });

    it('should set collapsibleSelectValue to true when useCriteria is set to true', () => {
        component.useCriteria = true;
        component.ngOnChanges({useCriteria: {} as SimpleChange});

        expect(component.useCriteria).toBe(true);
        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should set collapsibleSelectValue to false when useCriteria is set to false', () => {
        component.useCriteria = false;

        expect(component.useCriteria).toBe(false);
        expect(component.collapsibleSelectValue).toBe(false);
    });

    it('should return true when getUseCriteria is called and collapsibleSelectValue is true', () => {
        component.collapsibleSelectValue = true;

        expect(component.getUseCriteria()).toBeTruthy();
    });

    it('should return true when getUseCriteria is called and collapsibleSelectValue is indeterminate', () => {
        component.collapsibleSelectValue = 'indeterminate';

        expect(component.getUseCriteria()).toBeTruthy();
    });

    it('should return false when getUseCriteria is called when collapsibleSelectValue is false ', () => {
        component.collapsibleSelectValue = false;

        expect(component.getUseCriteria()).toBeFalsy();
    });

    it('should set the collapsibleSelectValue to false on setting the default values to empty and useCriteria to false', () => {
        const defaultValues: MilestoneFilterFormData = {
            types: [],
            projectCraftIds: [],
        };

        component.defaultValues = defaultValues;
        component.useCriteria = false;

        component.ngOnChanges({defaultValues: {} as SimpleChange, useCriteria: {} as SimpleChange});

        expect(component.collapsibleSelectValue).toBe(false);
    });

    it('should set the collapsibleSelectValue to false when craft query emits ' +
        'and the default values are empty and useCriteria is false', () => {
        const defaultValues: MilestoneFilterFormData = {
            types: [],
            projectCraftIds: [],
        };

        component.defaultValues = defaultValues;
        component.useCriteria = false;

        projectCraftSubject.next(craftList);

        expect(component.collapsibleSelectValue).toBe(false);
    });

    it('should emit a valueChanged event when emitValueChanged is true and the form value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = true;
        component.form.controls.selectedIds.setValue(['foo']);

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should emit a valueChanged event when emitValueChanged is true and the collapsible select value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = true;
        component.handleSelect(true);

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is false and the form value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = false;
        component.form.controls.selectedIds.setValue(['foo']);

        expect(component.valueChanged.emit).not.toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is true but the form value changed to an equivalent value', () => {
        component.emitValueChanged = true;
        component.form.controls.selectedIds.setValue(['foo']);

        spyOn(component.valueChanged, 'emit');

        component.form.controls.selectedIds.setValue(['foo']);

        expect(component.valueChanged.emit).not.toHaveBeenCalled();
    });
});
