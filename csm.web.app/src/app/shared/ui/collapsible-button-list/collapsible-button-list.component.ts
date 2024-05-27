/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewChild,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {BreakpointHelper} from '../../misc/helpers/breakpoint.helper';
import {UUID} from '../../misc/identification/uuid';
import {FlyoutService} from '../flyout/service/flyout.service';

export const COLLAPSIBLE_BUTTON_LIST_MAX_INLINE_BUTTONS_BY_SCREEN_SIZE = {
    xs: 1,
    sm: 2,
    md: 4,
};

@Component({
    selector: 'ss-collapsible-button-list',
    templateUrl: './collapsible-button-list.component.html',
    styleUrls: ['./collapsible-button-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleButtonListComponent implements AfterViewInit {

    @ViewChild('inlineButtons', {static: true})
    public inlineButtons: ElementRef;

    public collapsedButtonsFlyoutId = `ss-collapsible-button-list-flyout--${UUID.v4()}`;

    public showDropdownButton = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _breakpointHelper: BreakpointHelper,
                private _changeDetector: ChangeDetectorRef,
                private _flyoutService: FlyoutService) {
    }

    ngAfterViewInit(): void {
        this._setSubscriptions();
        this._setDropdownButtonVisibility();
    }

    public handleCollapsedButtonClick(): void {
        this._flyoutService.close(this.collapsedButtonsFlyoutId);
    }

    private _setDropdownButtonVisibility(): void {
        const currentBreakpoint = this._breakpointHelper.currentBreakpoint();
        const currentNumberOfButtons = Array.from(this.inlineButtons.nativeElement.children[0].children).length;
        const allowedNumberOfButtons = COLLAPSIBLE_BUTTON_LIST_MAX_INLINE_BUTTONS_BY_SCREEN_SIZE[currentBreakpoint];

        this.showDropdownButton = !!allowedNumberOfButtons && currentNumberOfButtons > allowedNumberOfButtons;

        this._changeDetector.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this._setDropdownButtonVisibility()));
    }
}
