/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

import {KeyEnum} from '../../misc/enums/key.enum';
import {
    ElementAlignment,
    ElementPosition
} from '../../misc/helpers/element-positioning.helper';
import {
    FlyoutCloseTriggerEnum,
    FlyoutOpenTriggerEnum
} from './directive/flyout.directive';
import {FlyoutContentTestComponent} from './flyout-content.test.component';
import {FlyoutService} from './service/flyout.service';

@Component({
    templateUrl: 'flyout.test.component.html',
    styleUrls: ['./flyout.test.component.scss']
})
export class FlyoutTestComponent implements OnDestroy {

    public flyoutComponent = FlyoutContentTestComponent;

    public flyoutProperties = {};

    public flyoutOver = false;

    public flyoutPosition: ElementPosition = 'below';

    public flyoutAlignment: ElementAlignment = 'end';

    public flyoutMobileDrawer = false;

    public flyoutComponentId = 'test-flyout-component';

    public flyoutTemplateId = 'test-flyout-template';

    public flyoutTemplateProperties = {};

    public flyoutInitializeId = 'test-flyout-initialize';

    public flyoutShowOverlay = true;

    public flyoutTrigger: FlyoutOpenTriggerEnum | FlyoutOpenTriggerEnum[] = FlyoutOpenTriggerEnum.Click;

    public flyoutTriggerElement: ElementRef;

    public flyoutCloseTrigger: FlyoutCloseTriggerEnum | FlyoutCloseTriggerEnum[] = FlyoutCloseTriggerEnum.Blur;

    public flyoutCloseKeyTriggers: KeyEnum[] = [];

    public flyoutUseTriggerWidth = false;

    public isFlyoutVisible = true;

    @Output()
    public isFlyoutOpen: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input()
    public closeFlyout(closeFlyout: boolean) {
        this.isFlyoutOpen.emit(closeFlyout);
    }

    constructor(private _flyoutService: FlyoutService) {
    }

    public openFlyout(): void {
        this.isFlyoutOpen.emit(this._flyoutService.isFlyoutOpen('calendar'));
    }

    public flyoutInitialized(flyoutId: string): void {
    }

    ngOnDestroy() {
    }
}
