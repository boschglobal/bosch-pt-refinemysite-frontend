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
import {TranslateModule} from '@ngx-translate/core';

import {
    DonutChartComponent,
    DonutChartSliceInterface
} from './donut-chart.component';

describe('Donut Chart Component', () => {
    let fixture: ComponentFixture<DonutChartComponent>;
    let comp: DonutChartComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const MOCK_FILLED_EMPTY_SLICE: DonutChartSliceInterface[] = [
        {
            label: 'Done',
            value: 1000,
            color: '#70bf54'
        },
        {
            label: 'In progress',
            value: 0,
            color: '#008ecf'
        },
        {
            label: 'Open',
            value: 0,
            color: '#bfc0c2',
            hoverOpacity: .4
        },
        {
            label: 'Draft',
            value: 0,
            color: '#dfdfe0'
        }
    ];

    const MOCK_FILLED_FULL_SLICES: DonutChartSliceInterface[] = [
        {
            label: 'Done',
            value: 1000,
            color: '#70bf54'
        },
        {
            label: 'In progress',
            value: 200,
            color: '#008ecf'
        },
        {
            label: 'Open',
            value: 200,
            color: '#bfc0c2',
            hoverOpacity: .4
        },
        {
            label: 'Draft',
            value: 100,
            color: '#dfdfe0'
        }
    ];

    const dataAutomationDonutChartPathsSelector = '[data-automation^="donut-chart-path"]';
    const dataAutomationDonutChartCenterSelector = '[data-automation="donut-chart-center"]';
    const dataAutomationDonutChartSinglePathSelector = (index: number): string => `[data-automation="donut-chart-path-${index}"]`;

    const getElement = (selector: string): Element => el.querySelector(selector);
    const getAllElements = (element: string): NodeListOf<Element> => el.querySelectorAll(element);

    const mouseEnterEvent: Event = new Event('mouseenter');
    const mouseLeaveEvent: Event = new Event('mouseleave');
    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [TranslateModule.forRoot()],
        declarations: [DonutChartComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DonutChartComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should render the same amount of path as slices with full slice values', () => {
        const totalSlices: number = MOCK_FILLED_FULL_SLICES.length;
        let totalRenderedSlices: number;

        comp.slices = MOCK_FILLED_FULL_SLICES;

        fixture.detectChanges();

        totalRenderedSlices = getAllElements(dataAutomationDonutChartPathsSelector).length;

        expect(totalSlices).toBe(totalRenderedSlices);
    });

    it('should render single path for single slice value', () => {
        const totalSlices = 1;
        let totalRenderedSlices: number;

        comp.slices = MOCK_FILLED_EMPTY_SLICE;

        fixture.detectChanges();

        totalRenderedSlices = getAllElements(dataAutomationDonutChartPathsSelector).length;

        expect(totalSlices).toBe(totalRenderedSlices);
    });

    it('should set value on sliceFocused after on mouse enter', () => {
        const path = 0;

        comp.slices = MOCK_FILLED_FULL_SLICES;

        fixture.detectChanges();

        getElement(dataAutomationDonutChartSinglePathSelector(path)).dispatchEvent(mouseEnterEvent);
        expect(comp.sliceFocused).not.toBeNull();
    });

    it('should unset value on sliceFocused after on mouse leave', () => {
        const path = 2;

        comp.slices = MOCK_FILLED_FULL_SLICES;

        fixture.detectChanges();

        getElement(dataAutomationDonutChartSinglePathSelector(path)).dispatchEvent(mouseLeaveEvent);
        expect(comp.sliceFocused).toBeNull();
    });

    it('should get 1 when slice and sliceFocused labels match', () => {
        const slice = 3;

        comp.sliceFocused = MOCK_FILLED_FULL_SLICES[slice];
        expect(comp.getPathFillOpacity(MOCK_FILLED_FULL_SLICES[slice])).toBe(1);
    });

    it('should get correct hoverOpacity when slice and sliceFocused labels match', () => {
        let slice: number;

        slice = 2;
        comp.sliceFocused = MOCK_FILLED_FULL_SLICES[slice];

        slice = 3;
        expect(comp.getPathFillOpacity(MOCK_FILLED_FULL_SLICES[slice])).toBe(comp.defaultHoverOpacity);
    });

    it('should get the correct label when slice is focused', () => {
        const slice = 1;

        comp.sliceFocused = MOCK_FILLED_FULL_SLICES[slice];

        expect(comp.getLabel()).toBe(comp.sliceFocused.label);
    });

    it('should get the correct value when slice is focused', () => {
        const slice = 0;

        comp.sliceFocused = MOCK_FILLED_FULL_SLICES[slice];

        expect(comp.getValue()).toBe(comp.sliceFocused.value);
    });

    it('should emit when chart slice is clicked', () => {
        const path = 2;
        spyOn(comp.clickSlice, 'emit').and.callThrough();

        comp.slices = MOCK_FILLED_FULL_SLICES;

        fixture.detectChanges();

        getElement(dataAutomationDonutChartSinglePathSelector(path)).dispatchEvent(clickEvent);

        expect(comp.clickSlice.emit).toHaveBeenCalledWith(MOCK_FILLED_FULL_SLICES[path]);
    });

    it('should emit when chart center is clicked', () => {
        spyOn(comp.clickCenter, 'emit').and.callThrough();

        comp.slices = MOCK_FILLED_FULL_SLICES;

        fixture.detectChanges();

        getElement(dataAutomationDonutChartCenterSelector).dispatchEvent(clickEvent);

        expect(comp.clickCenter.emit).toHaveBeenCalled();
    });
});
