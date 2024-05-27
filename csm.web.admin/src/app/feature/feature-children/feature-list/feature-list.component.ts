/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {FeatureAction} from '../../feature-common/store/feature.actions';
import {FeatureCreateComponent} from '../feature-create/feature-create.component';
import {FeatureEditComponent} from '../feature-edit/feature-edit.component';
import {FeatureFormResource} from '../../feature-common/api/resources/feature-form.resource';
import {FeatureQueries} from '../../feature-common/store/feature.queries';
import {
    FeatureResource,
    FeatureStateEnum
} from '../../feature-common/api/resources/feature.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-feature-list',
    templateUrl: './feature-list.component.html',
    styleUrls: ['./feature-list.component.scss']
})
export class FeatureListComponent implements OnInit, OnDestroy, AfterViewInit {
    public displayedColumns: string[] = ['name', 'status', 'actions'];

    public features = new Array<FeatureResource>();

    public isLoading = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _featureQueries: FeatureQueries,
                private _dialog: MatDialog,
                private _focusMonitor: FocusMonitor,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._requestFeatures();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._store.dispatch(new FeatureAction.Initialize.All());
    }

    ngAfterViewInit() {
        this._stopFocusMonitoring();
    }

    private _requestFeatures(): void {
        this._store.dispatch(new FeatureAction.Request.Features());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._featureQueries
                .observeCurrentFeatureList()
                .subscribe(features => this._setFeatures(features))
        );

        this._disposableSubscriptions.add(
            this._featureQueries
                .observeCurrentFeatureListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );
    }

    public openCreateModal(): void {
        const dialog = this._dialog.open(FeatureCreateComponent);
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public openEditModal(feature: FeatureResource): void {
        const data = new FeatureFormResource(feature.name, feature.state);

        const dialog = this._dialog.open(FeatureEditComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public getStatus(state: FeatureStateEnum): string {
        const formattedState = state.replace('_', '');
        return FeatureStateEnum[formattedState];
    }

    private _setFeatures(features: FeatureResource[]): void {
        this.features = features;
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }

    private _stopFocusMonitoring() {
        /**
         * This code prevents Angular native monitoring from
         * applying the focused styles to the incorrect element
         */
        this._focusMonitor.stopMonitoring(document.getElementById('name'));
    }

}
