/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    transition,
    trigger,
    useAnimation
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {
    bulgeInAnimation,
    bulgeOutAnimation
} from '../../animation/bulge/bulge.animation';
import {COLORS} from '../constants/colors.constant';

export enum TransitionStatusEnum {
    InProgress = 'progress',
    Completed = 'completed',
    Error = 'error',
}

@Component({
    selector: 'ss-status-transition',
    templateUrl: './status-transition.component.html',
    styleUrls: ['./status-transition.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('statusIconAnimation', [
            transition(':enter', [
                useAnimation(bulgeInAnimation),
            ]),
            transition(':leave', [
                useAnimation(bulgeOutAnimation),
            ]),
        ]),
    ],
})
export class StatusTransitionComponent {

    /**
     * @description Property with description information
     */
    @Input()
    public description: string;

    /**
     * @description Property with title information
     */
    @Input()
    public title: string;

    /**
     * @description Input that defines if the title should be translated or not
     * @type {boolean}
     */
    @Input()
    public translateTitle = true;

    /**
     * @description Boolean to show cancel button
     */
    @Input()
    public showCancelButton = false;

    /**
     * @description Property with status information
     */
    @Input()
    public status: TransitionStatusEnum;

    /**
     * @description Forwards cancel event
     * @type {EventEmitter}
     */
    @Output()
    public cancel: EventEmitter<any> = new EventEmitter();

    public isLoading = TransitionStatusEnum.InProgress;

    public isCompleted = TransitionStatusEnum.Completed;

    public isError = TransitionStatusEnum.Error;

    public statusInProgressIconColor = COLORS.light_green;

    public statusErrorIconColor = COLORS.red;

    public handleCancel(): void {
        this.cancel.emit();
    }

}
