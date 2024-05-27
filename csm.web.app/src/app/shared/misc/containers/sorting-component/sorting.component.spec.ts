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
import {
    Action,
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {
    MOCK_INITIAL_STATE,
    MOCK_REDUCER,
    MockState
} from '../../../../../test/mocks/reducers';
import {
    InitializeMockResourceAction,
    SetMockResourceSortAction
} from '../../../../../test/mocks/store/mock-resource.actions';
import {MOCK_RESOURCE_REDUCER} from '../../../../../test/mocks/store/mock-resource.reducer';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {SelectOption} from '../../../ui/forms/input-select-dropdown/input-select-dropdown.component';
import {SortDirectionEnum} from '../../../ui/sorter/sort-direction.enum';
import {SorterData} from '../../../ui/sorter/sorter-data.datastructure';
import {MiscModule} from '../../misc.module';
import {SortingComponent} from './sorting.component';

describe('Sorting Component', () => {
    let fixture: ComponentFixture<SortingComponent>;
    let comp: SortingComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<MockState>;

    const sortMethods: SelectOption[] = [
        {label: 'Foo', value: 'foo'},
        {label: 'Bar', value: 'bar'},
    ];
    const testDataSorterData: SorterData = new SorterData(sortMethods[0].value, SortDirectionEnum.desc);
    const sorterDataSelectorFunction: (state: any) => {} = (state: MockState) => state.mockResourceSlice.mockResourceListSort;
    const setSortAction: Action = new SetMockResourceSortAction(testDataSorterData);
    const initializerAction: Action = new InitializeMockResourceAction();
    const dataAutomationSelectorCancel = '[data-automation="cancel-sort"]';
    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [
            MiscModule,
            StoreModule.forRoot(MOCK_REDUCER, {initialState: MOCK_INITIAL_STATE}),
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SortingComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        store = TestBed.inject(Store);

        comp.sorterDataSelectorFunction = sorterDataSelectorFunction;
        comp.setSortAction = SetMockResourceSortAction;
        comp.sortMethods = sortMethods;
        fixture.detectChanges();
    });

    afterEach(() => {
        store.dispatch(initializerAction);
    });

    it('should query the right state from the store', () => {
        const {field, direction} = MOCK_INITIAL_STATE.mockResourceSlice.mockResourceListSort;
        expect(comp.formGroup.get('field').value).toBe(field);
        expect(comp.formGroup.get('direction').value).toBe(direction);
    });

    it('should update form after update of sort data', () => {
        const {field, direction} = MOCK_RESOURCE_REDUCER(MOCK_INITIAL_STATE.mockResourceSlice, setSortAction).mockResourceListSort;
        comp.formGroup.get('field').setValue(testDataSorterData.field);
        comp.formGroup.get('direction').setValue(testDataSorterData.direction);
        comp.onSubmitForm();

        expect(comp.formGroup.get('field').value).toBe(field);
        expect(comp.formGroup.get('direction').value).toBe(direction);
    });

    it('should not submit when the sort data didn\'t change', () => {
        spyOn(comp, 'setSortAction');
        comp.onSubmitForm();

        expect(comp.setSortAction).not.toHaveBeenCalled();
    });
});
