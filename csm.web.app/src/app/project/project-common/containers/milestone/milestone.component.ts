/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {Milestone} from '../../models/milestones/milestone';
import {MilestoneMarkerModel} from '../../presentationals/milestone-marker/milestone-marker.component';
import {RelationQueries} from '../../store/relations/relation.queries';

export const CSS_CLASS_DIMMED_OUT = 'ss-milestone--dimmed-out';
export const CSS_CLASS_FOCUSED = 'ss-milestone--focused';
export const CSS_CLASS_MOVABLE = 'ss-milestone--movable';
export const CSS_CLASS_NOT_SELECTABLE = 'ss-milestone--not-selectable';
export const CSS_CLASS_SELECTED = 'ss-milestone--selected';
export const MILESTONE_ID_PREFIX = 'ss-milestone-';

@Component({
    selector: 'ss-milestone',
    templateUrl: './milestone.component.html',
    styleUrls: ['./milestone.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneComponent implements OnChanges, OnInit, OnDestroy {

    @Input()
    public canDragMilestone = true;

    @Input()
    public canSelectMilestone = true;

    @Input()
    public focusedMilestoneId: string;

    @Input()
    public isDimmedOut = false;

    @Input()
    public milestone: Milestone;

    @Input()
    public selectedMilestoneIds: string[] = [];

    @Output()
    public selectMilestone: EventEmitter<string> = new EventEmitter<string>();

    public classes: { [key: string]: boolean };

    public isCritical: boolean;

    public isFocused: boolean;

    public isSelected: boolean;

    public milestoneIdPrefix = MILESTONE_ID_PREFIX;

    public milestoneMarker: MilestoneMarkerModel;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _relationQueries: RelationQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('milestone' in changes || 'focusedMilestoneId' in changes) {
            this._setFocused();
        }
        if ('milestone' in changes || 'selectedMilestoneIds' in changes) {
            this._setSelected();
        }
        if ('milestone' in changes) {
            this._setMilestoneMarker();
        }
        this._setClasses();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._relationQueries.observeFinishToStartRelationsCriticalityByMilestoneId(this.milestone.id)
                .subscribe(isCritical => {
                    this.isCritical = isCritical;
                    this._changeDetectorRef.detectChanges();
                }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleSelect(): void {
        this.selectMilestone.emit(this.milestone.id);
    }

    private _setClasses(): void {
        const canUpdate = this.milestone.permissions.canUpdate;

        this.classes = {
            [CSS_CLASS_DIMMED_OUT]: this.isDimmedOut,
            [CSS_CLASS_FOCUSED]: this.isFocused,
            [CSS_CLASS_MOVABLE]: canUpdate && this.canDragMilestone,
            [CSS_CLASS_NOT_SELECTABLE]: !this.canSelectMilestone,
            [CSS_CLASS_SELECTED]: this.isSelected,
        };
    }

    private _setMilestoneMarker(): void {
        this.milestoneMarker = {
            type: this.milestone.type,
            color: this.milestone.craft?.color,
        };
    }

    private _setFocused(): void {
        this.isFocused = this.milestone.id === this.focusedMilestoneId;
    }

    private _setSelected(): void {
        this.isSelected = this.selectedMilestoneIds.includes(this.milestone.id);
    }
}
