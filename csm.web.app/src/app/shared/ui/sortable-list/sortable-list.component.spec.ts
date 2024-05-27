/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDragDrop,
    DragDropModule
} from '@angular/cdk/drag-drop';
import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {
    MOCK_WORKAREA_MODEL_A,
    MOCK_WORKAREA_MODEL_NOT_DRAGGABLE,
    MOCK_WORKAREAS_MODEL
} from '../../../../test/mocks/workareas';
import {TranslationModule} from '../../translation/translation.module';
import {
    SortableListComponent,
    SortableListSort
} from './sortable-list.component';
import {SortableListTestComponent} from './sortable-list.test.component';

describe('Sortable List Component', () => {
    let testHostComp: SortableListTestComponent;
    let comp: SortableListComponent;
    let fixture: ComponentFixture<SortableListTestComponent>;
    let de: DebugElement;

    const getElement = (selector: string) => fixture.debugElement.query(By.css(selector)).nativeElement;
    const sortableListCssSelector = 'ss-sortable-list';
    const dataAutomationListItem = '[data-automation^="sortable-list-item"]';

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule.forRoot(),
            DragDropModule,
        ],
        declarations: [
            SortableListComponent,
            SortableListTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SortableListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(sortableListCssSelector));
        comp = de.componentInstance;

        testHostComp.records = MOCK_WORKAREAS_MODEL;

        fixture.detectChanges();
    });

    it('should render one row per record passed', () => {
        const totalRows = MOCK_WORKAREAS_MODEL.length;
        const numberOfRenderedRows = de.queryAll(By.css(dataAutomationListItem)).length;

        expect(numberOfRenderedRows).toBe(totalRows);
    });

    it('should allow drag when has drag permission and editIndex null', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_A];
        testHostComp.editIndex = null;

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toBe(true);
    });

    it('should allow drag when has drag permission and editIndex is undefined', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_A];
        testHostComp.editIndex = undefined;

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toBe(true);
    });

    it('should not allow drag when has drag permission and editIndex is 0', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_A];
        testHostComp.editIndex = 0;

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toBe(false);
    });

    it('should not allow drag when has drag permission and editIndex is 1', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_A];
        testHostComp.editIndex = 1;

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toBe(false);
    });

    it('should emit sort when item is dropped in a different index than the previous', () => {
        spyOn(comp.sort, 'emit').and.callThrough();

        const currentIndex = 1;
        const previousIndex = 0;
        const expectedResult: SortableListSort = {
            currentIndex,
            previousIndex,
            item: MOCK_WORKAREAS_MODEL[0],
        };

        comp.handleDrop({currentIndex, previousIndex} as CdkDragDrop<any>);

        expect(comp.sort.emit).toHaveBeenCalledWith(expectedResult);
    });

    it('should emit sort when item is dropped in a different index than the previous', () => {
        spyOn(comp.sort, 'emit').and.callThrough();

        const currentIndex = 0;
        const previousIndex = 0;
        const expectedResult: SortableListSort = {
            currentIndex,
            previousIndex,
            item: MOCK_WORKAREAS_MODEL[0],
        };

        comp.handleDrop({currentIndex, previousIndex} as CdkDragDrop<any>);

        expect(comp.sort.emit).not.toHaveBeenCalledWith(expectedResult);
    });

    it('should render one row with drag enabled', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_A];

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toEqual(true);
        expect(getElement(dataAutomationListItem).classList).toContain('ss-sortable-list__item--draggable');
    });

    it('should render one row with drag disabled', () => {
        testHostComp.records = [MOCK_WORKAREA_MODEL_NOT_DRAGGABLE];

        fixture.detectChanges();

        expect(comp.parsedRecords[0].drag).toEqual(false);
        expect(getElement(dataAutomationListItem).classList).not.toContain('ss-sortable-list__item--draggable');
    });
});
