/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

interface SliceAnchors {
    P: {
        x: number
        y: number
    };
    Q: {
        x: number
        y: number
    };
    R: {
        x: number
        y: number
    };
    S: {
        x: number
        y: number
    };
}

export interface DonutChartSliceInterface {
    id?: string;
    label: string;
    value: number;
    color: string;
    hoverOpacity?: number;
}

@Component({
    selector: 'ss-donut-chart',
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
    /**
     * @description Component dimension
     * @type {number}
     */
    @Input()
    public dimension = 0;

    /**
     * @description Inner circle size
     * @type {number}
     */
    @Input()
    public innerCircle = 0;

    /**
     * @description Label string
     */
    @Input()
    public label: string;

    /**
     * @description Slices to be rendered
     * @type {Array}
     */
    @Input()
    public slices: DonutChartSliceInterface[] = [];

    /**
     * @description Default hover opacity
     * @type {number}
     */
    @Input()
    public defaultHoverOpacity = .6;

    /**
     * @description Triggered when slice is clicked
     * @type {EventEmitter<DonutChartSliceInterface>}
     */
    @Output()
    public clickSlice: EventEmitter<DonutChartSliceInterface> = new EventEmitter<DonutChartSliceInterface>();

    /**
     * @description Triggered when center is clicked
     * @type {EventEmitter<void>}
     */
    @Output()
    public clickCenter: EventEmitter<null> = new EventEmitter<null>();

    /**
     * @description Current focused slice
     */
    public sliceFocused: DonutChartSliceInterface;

    private _startAngle = 0;

    /**
     * @description Retrieve svg viewBox
     * @returns {string}
     */
    public get getViewBox(): string {
        return `0 0 ${this.getDimension} ${this.getDimension}`;
    }

    /**
     * @description Retrieve svg dimension in pixels
     * @returns {string}
     */
    public get getPXDimension(): string {
        return `${this.dimension.toString()}px`;
    }

    /**
     * @description Retrieve component dimension
     * @returns {number}
     */
    public get getDimension(): number {
        return this.dimension;
    }

    /**
     * @description Track by function for path
     * @param {number} index
     * @param {DonutChartSliceInterface} item
     * @returns {number}
     */
    public trackByFn(index: number, item: DonutChartSliceInterface): number {
        return index;
    }

    /**
     * @description Triggered when mouse enters
     * @param {DonutChartSliceInterface} slice
     */
    public handleMouseEnter(slice: DonutChartSliceInterface): void {
        this.sliceFocused = slice;
    }

    /**
     * @description Triggered when mouse leaves
     */
    public handleMouseLeave(): void {
        this.sliceFocused = null;
    }

    /**
     * @description Triggered when center is clicked
     */
    public handleClickCenter(event: Event): void {
        event.stopPropagation();
        this.clickCenter.emit();
    }

    /**
     * @description Triggered when slice is clicked
     * @param {Event} event
     * @param {DonutChartSliceInterface} slice
     */
    public handleClickSlice(event: Event, slice: DonutChartSliceInterface): void {
        event.stopPropagation();
        this.clickSlice.emit(slice);
    }

    /**
     * @description Retrieve data automation selector
     * @param {string} selector
     * @param {number} index
     * @returns {string}
     */
    public getDataAutomationSelector(selector: string, index?: number): string {
        return `${selector}${index || index === 0 ? '-' + index : ''}`;
    }

    /**
     * @description Retrieve label to be shown
     * @returns {string}
     */
    public getLabel(): string {
        return this.sliceFocused ? this.sliceFocused.label : this.label;
    }

    /**
     * @description Retrieve value to be shown
     * @returns {number}
     */
    public getValue(): number {
        return this.sliceFocused ? this.sliceFocused.value : this.getTotal();
    }

    /**
     * @description Retrieve summed value slices
     * @returns {number}
     */
    public getTotal(): number {
        return this.slices.reduce((a: number, b: DonutChartSliceInterface) => a + b.value, 0);
    }

    /**
     * @description Retrieve fill of slice passed in
     * @param {DonutChartSliceInterface} slice
     * @returns {string}
     */
    public getPathFill(slice: DonutChartSliceInterface): string {
        return slice.color;
    }

    /**
     * @description Retrieve fill opacity of slice passed in
     * @param {DonutChartSliceInterface} slice
     * @returns {number}
     */
    public getPathFillOpacity(slice: DonutChartSliceInterface): number {
        if (!this.sliceFocused) {
            return 1;
        }

        const hoverOpacity: number = slice.hoverOpacity ? slice.hoverOpacity : this.defaultHoverOpacity;

        return this.sliceFocused && this.sliceFocused.label === slice.label ? 1 : hoverOpacity;
    }

    /**
     * @description Checks if a given path can be rendered
     * @param {DonutChartSliceInterface} slice
     * @returns {boolean}
     */
    public canRenderPath(slice: DonutChartSliceInterface): boolean {
        return slice.value > 0 && this.getTotal() > 0;
    }

    /**
     * @description Retrieve path data of empty slice or path data of slice passed in
     * @param {DonutChartSliceInterface} slice
     * @returns {string}
     */
    public getPathData(slice: DonutChartSliceInterface): string {
        return this._canRenderEmptySlice() ? this.getEmptyPathData() : this._getCompoundPathData(slice);
    }

    /**
     * @description Retrieve path data of empty slice
     * @returns {string}
     */
    public getEmptyPathData(): string {
        const outerCircle: number = this.getDimension / 2;

        return `
            M ${outerCircle} ${outerCircle}
            m 0 -${outerCircle}
            a ${outerCircle} ${outerCircle} 0 1 0 1 0
            Z
            m 0 ${outerCircle - this.innerCircle}
            a ${this.innerCircle} ${this.innerCircle} 0 1 1 -1 0
            Z
        `;
    }

    private _getCompoundPathData(slice: DonutChartSliceInterface): string {
        const outerCircle: number = this.getDimension / 2;
        const sectorAngle: number = this._getScaledData(slice.value);
        const calculatedAnchor: SliceAnchors = this._getCalculatedAnchors(this._startAngle, this._startAngle + sectorAngle, outerCircle, this.innerCircle);

        const {P, Q, R, S} = calculatedAnchor;

        this._startAngle += sectorAngle;

        const endAngle: number = this._startAngle + sectorAngle;
        const largeArc: boolean = endAngle - this._startAngle > Math.PI;

        return `
            M ${P.x}, ${P.y}
            A ${outerCircle} ${outerCircle} 0 ${largeArc ? '1,1' : '0,1'} ${Q.x} ${Q.y}
            L ${R.x} ${R.y}
            A ${this.innerCircle} ${this.innerCircle} 0 ${largeArc ? '1,0' : '0,0'} ${S.x} ${S.y}
            Z
        `;
    }

    private _canRenderEmptySlice(): boolean {
        let slicesWithValue = 0;

        this.slices.forEach((slice: DonutChartSliceInterface) => {
            if (slice.value > 0) {
                slicesWithValue++;
            }
        });

        return slicesWithValue === 1;
    }

    private _getCalculatedAnchors(startAngle: number, endAngle: number, outerCircle: number, innerCircle: number): SliceAnchors {
        const sinAlpha: number = this._getAbbreviatedNumber(Math.sin(startAngle));
        const cosAlpha: number = this._getAbbreviatedNumber(Math.cos(startAngle));
        const sinBeta: number = this._getAbbreviatedNumber(Math.sin(endAngle));
        const cosBeta: number = this._getAbbreviatedNumber(Math.cos(endAngle));

        const P = {
            x: outerCircle + (outerCircle * sinAlpha),
            y: outerCircle - (outerCircle * cosAlpha)
        };

        const Q = {
            x: outerCircle + (outerCircle * sinBeta),
            y: outerCircle - (outerCircle * cosBeta)
        };

        const R = {
            x: outerCircle + (innerCircle * sinBeta),
            y: outerCircle - (innerCircle * cosBeta)
        };

        const S = {
            x: outerCircle + (innerCircle * sinAlpha),
            y: outerCircle - (innerCircle * cosAlpha)
        };

        return {P, Q, R, S};
    }

    private _getScaledData(value: number): number {
        return (value * Math.PI * 2) / this.getTotal() || 0;
    }

    private _getAbbreviatedNumber(number: number, digits = 12): number {
        return parseFloat(Number(number).toFixed(digits));
    }
}
