/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {
    CSS_CLASS_SELECT_LIST_OPTION_ACTIVE,
    SelectListComponent,
    SelectListOption
} from './select-list.component';
import {SelectListTestComponent} from './select-list.test.component';

describe('SelectListComponent', () => {
    let testHostComponent: SelectListTestComponent;
    let component: SelectListComponent;
    let debugElement: DebugElement;
    let fixture: ComponentFixture<SelectListTestComponent>;

    const selectListSelector = 'ss-select-list';
    const optionsSelector = '[data-automation^="select-list-option"]';
    const firstOptionSelector = '[data-automation="select-list-option-foo"]';
    const lastOptionSelector = '[data-automation="select-list-option-bar"]';

    const options: SelectListOption[] = [
        {
            id: 'foo',
            displayName: 'foo'
        },
        {
            id: 'bar',
            displayName: 'bar'
        }
    ];

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            SelectListComponent,
            SelectListTestComponent,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectListTestComponent);
        testHostComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css(selectListSelector));
        component = debugElement.componentInstance;

        testHostComponent.options = options;
        testHostComponent.selected = options[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct selected option', () => {
        expect(component.selected).toEqual(options[0]);
    });

    it('should select and retrieve the correct selected option', () => {
        component.select(options[1]);

        fixture.detectChanges();

        expect(component.selected).toEqual(options[1]);
    });

    it('should render one button for each option specified', () => {
        expect(debugElement.queryAll(By.css(optionsSelector)).length).toBe(options.length);
    });

    it('should emit change when button option is clicked', () => {
        const expectedResult = options[0];

        spyOn(component.change, 'emit').and.callThrough();

        testHostComponent.selected = options[1];
        fixture.detectChanges();

        debugElement.query(By.css(firstOptionSelector)).nativeElement.dispatchEvent(clickEvent);

        expect(component.change.emit).toHaveBeenCalledWith(expectedResult);
    });

    it('should not emit a change twice for a option that is already selected', () => {
        const unselectedOption = options[1];

        spyOn(component.change, 'emit').and.callThrough();

        component.select(unselectedOption);
        component.select(unselectedOption);

        expect(component.change.emit).toHaveBeenCalledWith(unselectedOption);
        expect(component.change.emit).toHaveBeenCalledTimes(1);
    });

    it('should have CSS_CLASS_SELECT_LIST_OPTION_ACTIVE class for active option', () => {
        testHostComponent.selected = options[1];

        fixture.detectChanges();

        expect(debugElement.query(By.css(lastOptionSelector)).classes[CSS_CLASS_SELECT_LIST_OPTION_ACTIVE]).toBeTruthy();
    });

    it('should retrieve CSS_CLASS_SELECT_LIST_ACTIVE attribute class set to true', () => {
        component.select(options[0]);

        fixture.detectChanges();

        expect(component.getButtonClasses(options[0])[CSS_CLASS_SELECT_LIST_OPTION_ACTIVE]).toBeTruthy();
    });
});
