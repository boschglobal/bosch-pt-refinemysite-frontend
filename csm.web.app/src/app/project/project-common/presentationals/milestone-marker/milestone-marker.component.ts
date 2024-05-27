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
    Input,
} from '@angular/core';

import {ColorHelper} from '../../../../shared/misc/helpers/color.helper';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';

export const CSS_CLASS_DIMMED_OUT = 'ss-milestone-marker--dimmed-out';
export const CSS_CLASS_SELECTED = 'ss-milestone-marker--selected';
export const CSS_CLASS_CRITICAL = 'ss-milestone-marker--critical';

const MILESTONE_TYPE_CLASSES: { [key in MilestoneTypeEnum]: string } = {
    [MilestoneTypeEnum.Investor]: 'ss-milestone-marker--investor',
    [MilestoneTypeEnum.Project]: 'ss-milestone-marker--project',
    [MilestoneTypeEnum.Craft]: 'ss-milestone-marker--craft',
};

@Component({
    selector: 'ss-milestone-marker',
    templateUrl: './milestone-marker.component.html',
    styleUrls: ['./milestone-marker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneMarkerComponent {

    @Input()
    public set isDimmedOut(value: boolean) {
        this._isDimmedOut = value;
        this._setMarkerClasses();
        this._setMarkerColor();
    }

    @Input()
    public isFocused: boolean;

    @Input()
    public set isSelected(value: boolean) {
        this._isSelected = value;

        this._setMarkerClasses();
        this._setMarkerColor();
    }

    public get isSelected(): boolean {
        return this._isSelected;
    }

    @Input()
    public set milestoneMarker(milestoneMarker: MilestoneMarkerModel) {
        this._milestoneMarker = milestoneMarker;

        this._setMarkerType();
        this._setMarkerColor();
        this._setMarkerClasses();
    }

    @Input()
    public set isCritical(value: boolean) {
        this._isCritical = value;

        this._setMarkerClasses();
    }

    public get isCritical(): boolean {
        return this._isCritical;
    }

    public markerClasses: { [key: string]: boolean };

    public markerColor: string;

    public markerType: MilestoneTypeEnum;

    private _isDimmedOut = false;

    private _isSelected: boolean;

    private _isCritical: boolean;

    private _milestoneMarker: MilestoneMarkerModel;

    private _setMarkerClasses(): void {
        const type = this._milestoneMarker?.type;

        this.markerClasses = {
            [MILESTONE_TYPE_CLASSES[type]]: true,
            [CSS_CLASS_CRITICAL]: !this._isSelected && this._isCritical,
            [CSS_CLASS_DIMMED_OUT]: this._isDimmedOut,
            [CSS_CLASS_SELECTED]: this._isSelected,
        };
    }

    private _setMarkerColor(): void {
        const {type, color} = this._milestoneMarker || {};
        if (!this._isSelected && color && type === MilestoneTypeEnum.Craft) {
            this.markerColor = this._isDimmedOut ? ColorHelper.blendColor(color, '#fff', 0.2) : color;
        } else {
            this.markerColor = null;
        }
    }

    private _setMarkerType(): void {
        this.markerType = this._milestoneMarker?.type;
    }
}

export interface MilestoneMarkerModel {
    type: MilestoneTypeEnum;
    color?: string;
}
