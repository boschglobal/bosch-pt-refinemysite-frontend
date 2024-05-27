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
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    Subscription,
    timer
} from 'rxjs';

import {AlertResource} from '../../api/resources/alert.resource';

@Component({
    selector: 'ss-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent implements OnInit, OnDestroy {

    @Input()
    public alert: AlertResource;

    @Output()
    public close: EventEmitter<string> = new EventEmitter<string>();

    private _destroyDelay = 5000;

    private _disposableSubscriptions: Subscription = new Subscription();

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * Emits an event to close this alert
     */
    public handleClose(): void {
        this.close.emit(this.alert.id);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            timer(this._destroyDelay)
                .subscribe(() => this.handleClose())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
