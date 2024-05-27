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
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {ProjectFilterFormData} from '../project-filter-capture/project-filter-capture.component';
import {QuickFilterCaptureComponent} from './quick-filter-capture.component';
import {QuickFilterCaptureTestComponent} from './quick-filter-capture.test.component';

describe('Quick Filter Capture Component', () => {
    let testComponent: QuickFilterCaptureTestComponent;
    let component: QuickFilterCaptureComponent;
    let fixture: ComponentFixture<QuickFilterCaptureTestComponent>;
    let store: jasmine.SpyObj<Store>;

    const filterCaptureRef = jasmine.createSpyObj('ProjectFilterCaptureComponent', ['getFormValue']);
    const dataAutomationQuickFilterCapture = '[data-automation="quick-filter-capture"]';

    const MOCK_PROJECT_FILTER_FORM_DATA: ProjectFilterFormData = {
        milestone: new MilestoneFilters(),
        task: new ProjectTaskFilters(),
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            QuickFilterCaptureComponent,
            QuickFilterCaptureTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(QuickFilterCaptureTestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        component = fixture.debugElement.query(By.css(dataAutomationQuickFilterCapture)).componentInstance;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        filterCaptureRef.getFormValue.and.returnValue(MOCK_PROJECT_FILTER_FORM_DATA);
        component.filterCapture = filterCaptureRef;
    });

    it('should focus on name input on component initialization', () => {
        spyOn(component.nameInput, 'setFocus');

        component.form.controls.name.setValue('');

        component.ngOnInit();

        expect(component.nameInput.setFocus).toHaveBeenCalled();
    });

    it('should not focus on name input on component initialization when name is already defined', () => {
        spyOn(component.nameInput, 'setFocus');

        component.form.controls.name.setValue('foo');

        component.ngOnInit();

        expect(component.nameInput.setFocus).not.toHaveBeenCalled();
    });

    it('should retrieve the form value with the when getFormValue is called', () => {
        const expectedFormValue = {name: '', projectFilter: MOCK_PROJECT_FILTER_FORM_DATA};

        const actualFormValue = component.getFormValue();

        expect(actualFormValue).toEqual(expectedFormValue);
    });

    it('should emit the form validity when handleFormValidityChange is called', () => {
        spyOn(component.formValidity, 'emit');

        component.handleFilterCaptureFormValidityChange(true);

        expect(component.formValidity.emit).toHaveBeenCalled();
    });

    it('should set the form validity to false when setting a name which is longer than 100 characters', () => {
        spyOn(component.formValidity, 'emit');
        testComponent.defaultValue = {...testComponent.defaultValue, name: 'x'.repeat(101)};
        fixture.detectChanges();

        expect(component.formValidity.emit).toHaveBeenCalledWith(false);
    });

    it('should set the form validity to false when setting a name which is empty', () => {
        spyOn(component.formValidity, 'emit');
        testComponent.defaultValue = {...testComponent.defaultValue, name: ''};
        fixture.detectChanges();

        expect(component.formValidity.emit).toHaveBeenCalledWith(false);
    });

    it('should set the form validity to true when setting a name which is not empty and shorter than 100 characters', () => {
        spyOn(component.formValidity, 'emit');
        testComponent.defaultValue = {...testComponent.defaultValue, name: 'Quick filter'};
        fixture.detectChanges();

        expect(component.formValidity.emit).toHaveBeenCalledWith(true);
    });

    it('should dispatch action to request crafts on ngOnInit', () => {
        const expectedAction = new ProjectCraftActions.Request.All();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch action to request workAreas on ngOnInit', () => {
        const expectedAction = new WorkareaActions.Request.All();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
