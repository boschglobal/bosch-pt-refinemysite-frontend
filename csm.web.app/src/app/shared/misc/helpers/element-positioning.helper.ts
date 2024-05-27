/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DIMENSIONS} from '../../ui/constants/dimensions.constant';
import {Point} from '../generic-types/point.type';

export const ELEMENT_POSITIONING_HELPER_OFFSET_VALUE = DIMENSIONS.base_dimension;

export class ElementPositioningHelper {
    private _offset = ELEMENT_POSITIONING_HELPER_OFFSET_VALUE;

    private _alignmentStrategy: ElementAlignment | ElementPlacementNormalized;

    private _positionStrategy: ElementPosition | ElementPlacementNormalized;

    private _windowDimensions: { [key: string]: string } = {
        width: 'innerWidth',
        height: 'innerHeight',
    };

    constructor(
        private _trigger: Element,
        private _component: Element,
        private _elementAlignment: ElementAlignment,
        private _elementPosition: ElementPosition,
        private _hoverTrigger = false,
    ) {
    }

    public getCoordinates(): Point {
        const componentRect = this._component.getBoundingClientRect();
        const triggerRect = this._trigger.getBoundingClientRect();

        return {
            x: this._findX(triggerRect, componentRect),
            y: this._findY(triggerRect, componentRect),
        };
    }

    private _findY(trigger: ClientRect | DOMRect, component: ClientRect | DOMRect): number {
        const position = 'top';
        const dimension = 'height';

        return this._isOpeningInXAxis() ?
            this._findAlignment(trigger, component, position, dimension) :
            this._findPosition(trigger, component, position, dimension);
    }

    private _findX(trigger: ClientRect | DOMRect, component: ClientRect | DOMRect): number {
        const position = 'left';
        const dimension = 'width';

        return !this._isOpeningInXAxis() ?
            this._findAlignment(trigger, component, position, dimension) :
            this._findPosition(trigger, component, position, dimension);
    }

    private _findAlignment(trigger: ClientRect | DOMRect, component: ClientRect | DOMRect, origin: string, dimension: string): number {
        const alignment: ElementAlignment = this._elementAlignment;
        const preferredStrategies = [alignment];
        const windowDimension = window[this._windowDimensions[dimension]];
        const normalizeToStart = trigger[origin] < (windowDimension / 2);

        const strategies: PlacementStrategies = {
            start: trigger[origin],
            center: trigger[origin] + (trigger[dimension] / 2) - (component[dimension] / 2),
            end: trigger[origin] + trigger[dimension] - component[dimension],
            normalized: normalizeToStart ? this._offset : windowDimension - component[dimension] - this._offset,
        };

        this._alignmentStrategy = this._validateLastStrategy(this._alignmentStrategy, strategies, dimension) ?
            this._alignmentStrategy :
            this._findPlacementStrategy(strategies, preferredStrategies, dimension);

        return strategies[this._alignmentStrategy];
    }

    private _findPosition(trigger: ClientRect | DOMRect, component: ClientRect | DOMRect, origin: string, dimension: string): number {
        let value: number;
        const position: ElementPosition = this._elementPosition;
        const triggerOffset = this._getTriggerOffset(trigger, dimension);
        const windowDimension = window[this._windowDimensions[dimension]];

        const strategies: PlacementStrategies = {
            above: trigger[origin] + triggerOffset - component[dimension],
            left: trigger[origin] + triggerOffset - component[dimension],
            below: trigger[origin] - triggerOffset + trigger[dimension],
            right: trigger[origin] - triggerOffset + trigger[dimension],
            normalized: Math.max((windowDimension - component[dimension] - this._offset), this._offset),
        };

        switch (position) {
            case 'above':
            case 'left': {
                const preferredStrategies = [position, 'below'];
                this._positionStrategy = this._validateLastStrategy(this._positionStrategy, strategies, dimension) ?
                    this._positionStrategy :
                    this._findPlacementStrategy(strategies, preferredStrategies, dimension);
                value = strategies[this._positionStrategy];
                break;
            }
            case 'below':
            case 'right': {
                const preferredStrategies = [position, 'above'];
                this._positionStrategy = this._validateLastStrategy(this._positionStrategy, strategies, dimension) ?
                    this._positionStrategy :
                    this._findPlacementStrategy(strategies, preferredStrategies, dimension);
                value = strategies[this._positionStrategy];
                break;
            }
            default:
                value = this._offset;
        }

        return value;
    }

    private _findPlacementStrategy(strategies, preferredStrategies, dimension) {
        const preferredStrategy = preferredStrategies.find(strategy => this._isComponentInsideView(strategies[strategy], dimension));
        const fallBackStrategy = 'normalized';

        return preferredStrategy || fallBackStrategy;
    }

    private _isComponentInsideView(refPosition: number, dimension: string): boolean {
        const componentRect = this._component.getBoundingClientRect();
        const componentLocation = refPosition + componentRect[dimension];
        const windowDimension = this._windowDimensions[dimension];
        const componentInsideWindow = componentLocation >= 0 && componentLocation < window[windowDimension];
        const refPositionInsideWindow = refPosition >= 0 && refPosition < window[windowDimension];

        return refPositionInsideWindow && componentInsideWindow;
    }

    private _validateLastStrategy(strategy: ElementAlignment | ElementPosition | ElementPlacementNormalized,
                                  strategies: PlacementStrategies, dimension: string): boolean {
        return strategy && strategy !== 'normalized' && this._isComponentInsideView(strategies[strategy], dimension) ;
    }

    private _getTriggerOffset(trigger: ClientRect | DOMRect, dimension: string): number {
        return this._hoverTrigger ? trigger[dimension] : 0;
    }

    private _isOpeningInXAxis(): boolean {
        return this._elementPosition === 'left' || this._elementPosition === 'right';
    }
}

export type ElementAlignment = 'start' | 'center' | 'end';

export type ElementPosition = 'left' | 'right' | 'above' | 'below';

type ElementPlacementNormalized = 'normalized';

type PlacementStrategies = {[key in ElementAlignment | ElementPosition | ElementPlacementNormalized]?: number};
