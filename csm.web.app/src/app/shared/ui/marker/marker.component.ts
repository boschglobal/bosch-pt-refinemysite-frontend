/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    state,
    style,
    transition,
    trigger,
    useAnimation
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

import {
    bulgeInAnimation,
    bulgeOutAnimation
} from '../../animation/bulge/bulge.animation';

export type MarkerSize = 'small' | 'medium';

@Component({
    selector: 'ss-marker',
    templateUrl: './marker.component.html',
    styleUrls: ['./marker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('bulgeInOut', [
            state('bulge-in', style({opacity: 1})),
            state('bulge-out', style({opacity: 0})),
            transition('bulge-out => bulge-in', [
                useAnimation(bulgeInAnimation, {
                    params: {
                        delay: '1000ms',
                        timing: '200ms',
                    },
                }),
            ]),
            transition('bulge-in => bulge-out', [
                useAnimation(bulgeOutAnimation),
            ]),
        ])],
})
export class MarkerComponent {

    @Input()
    public isVisible = true;

    @Input()
    public isCritical = false;

    @Input()
    public size: MarkerSize = 'medium';

    @Input()
    public triggerAnimation = true;

    @Input()
    public withBorder = false;
}
