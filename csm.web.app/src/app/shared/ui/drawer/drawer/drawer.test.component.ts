/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

@Component({
    template: `
        <ss-drawer *ngIf="showDrawer">
            <ng-template *ngIf="hasHeader" #header></ng-template>
            <ng-template *ngIf="hasBody" #body></ng-template>
            <ng-template *ngIf="hasFooter" #footer></ng-template>
        </ss-drawer>
    `,
})
export class DrawerTestComponent {

    public hasHeader = false;

    public hasBody = false;

    public hasFooter = false;

    public showDrawer = true;

}
