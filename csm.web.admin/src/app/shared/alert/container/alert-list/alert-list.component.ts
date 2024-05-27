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
import {MatSnackBar} from '@angular/material/snack-bar';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {ALERT_DISMISS_DELAY} from '../../../misc/constants/general.constants';

import {AlertActions} from '../../store/alert.actions';
import {AlertQueries} from '../../store/alert.queries';
import {AlertResource} from '../../api/resources/alert.resource';
import {SnackbarComponent} from '../../presentationals/snackbar/snackbar.component';
import {State} from '../../../../app.reducers';

@Component({
    selector: 'ss-alert-list',
    templateUrl: './alert-list.component.html',
})
export class AlertListComponent implements OnInit, OnDestroy {

    public alerts: AlertResource[];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _alertQueries: AlertQueries,
                private _store: Store<State>,
                private _snackBar: MatSnackBar) {
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
        this._openSnackBar(this.alerts[0]);
    }

    private _openSnackBar(alert: AlertResource) {
        if (alert) {
            this._snackBar.openFromComponent(SnackbarComponent, {
                data: alert,
                duration: ALERT_DISMISS_DELAY,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
            })
            .afterDismissed()
            .subscribe(() => this.handleClose(alert.id));
        }
    }
}
