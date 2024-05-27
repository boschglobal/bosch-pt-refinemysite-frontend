/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

export const CSS_CLASS_CARD_INFORMATION_CALL_FOR_ACTION = 'ss-card-information--call-for-action';

@Component({
    selector: 'ss-card-information',
    templateUrl: './card-information.component.html',
    styleUrls: ['./card-information.component.scss'],
})
export class CardInformationComponent {
    /**
     * @description Property with the icon to present
     */
    @Input() public icon: string;

    /**
     * @description Property with the title label to present
     */
    @Input() public title: string;

    /**
     * @description Property with the description to present
     */
    @Input() public description?: string;

    /**
     * @description Property that defines if card should be highlighted as a call for action
     */
    @Input() public callForAction = false;

    /**
     * @description Property that defines the size of the assigned users's image
     */
    @Input()
    public size: CardInformationSize = 'normal';

    public getCssClassModifier(cssClass: string): Object {
        return {
            [`${cssClass}--${this.size}`]: true
        };
    }

    public getCardClasses(): Object {
        return {
            [CSS_CLASS_CARD_INFORMATION_CALL_FOR_ACTION]: this.callForAction
        };
    }
}

export type CardInformationSize = 'normal' | 'small';
