/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import {MultipleSelectionToolbarConfirmationModeEnum} from './multiple-selection-toolbar-confirmation.component';

@Component({
    selector: 'ss-multiple-selection-toolbar-test',
    templateUrl: './multiple-selection-toolbar-confirmation.test.component.html',
    styles: [
        ':host {padding: 16px; display: block; max-width: 320px;}',
    ],
})
export class MultipleSelectionToolbarConfirmationTestComponent {

    public itemsCount = 0;

    public initialItemsCount = 0;

    public mode: MultipleSelectionToolbarConfirmationModeEnum = MultipleSelectionToolbarConfirmationModeEnum.Add;

    public emptyItemsLabel = 'NO_ITEMS';

    public selectedItemLabel = 'ITEM';

    public selectedItemsLabel = 'ITEMS';

    public handleDismiss(): void {}

    public handleSubmit(): void {}
}
