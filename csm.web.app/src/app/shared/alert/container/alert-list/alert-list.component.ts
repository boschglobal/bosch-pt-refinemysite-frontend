/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {AlertResource} from '../../api/resources/alert.resource';
import {AlertActions} from '../../store/alert.actions';
import {AlertQueries} from '../../store/alert.queries';

@Component({
    selector: 'ss-alert-list',
    templateUrl: './alert-list.component.html',
    styleUrls: ['./alert-list.component.scss'],
})
export class AlertListComponent implements OnInit, OnDestroy {

    public alerts: AlertResource[];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _alertQueries: AlertQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Closes a alert with id equal to alertId
     * @param alertId
     */
    public handleClose(alertId: string): void {
        this._store.dispatch(new AlertActions.Remove.Alert(alertId));
    }

    public trackByFn(index: number, item: AlertResource): string {
        return item.id;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._alertQueries.observeAlerts()
                .subscribe((alerts: AlertResource[]) => this._setAlerts(alerts))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setAlerts(alerts: AlertResource[]): void {
        this.alerts = alerts;
    }
}
