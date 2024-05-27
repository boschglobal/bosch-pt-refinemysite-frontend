/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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

import {UUID} from '../../misc/identification/uuid';

@Component({
    selector: 'ss-collapsible-select',
    templateUrl: './collapsible-select.component.html',
    styleUrls: ['./collapsible-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSelectComponent {

    @Input()
    public checkboxId = UUID.v4();

    @Input()
    public set value(newValue: CollapsibleSelectValue) {
        this.checkboxValue = newValue === true;
        this.checkboxIsIndeterminate = newValue === 'indeterminate';
    }

    @Input()
    public expanded = false;

    @Input()
    public label: string;

    @Input()
    public sectionId = UUID.v4();

    @Output()
    public selectAll = new EventEmitter();

    @Output()
    public deselectAll = new EventEmitter();

    @Output()
    public clickExpandButton = new EventEmitter<boolean>();

    public checkboxValue = false;

    public checkboxIsIndeterminate = false;

    public toggleSection(): void {
        this.expanded = !this.expanded;
        this.clickExpandButton.emit(this.expanded);
    }

    public handleClickCheckbox(event: Event): void {
        event.preventDefault();
        if (!this.checkboxValue) {
            this.value = true;
            this.selectAll.emit();
        } else {
            this.value = false;
            this.deselectAll.emit();
        }
    }
}

export type CollapsibleSelectValue = false | 'indeterminate' | true;
