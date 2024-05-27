/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS} from '@angular/material/slide-toggle';
import {MatTableDataSource} from '@angular/material/table';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {CompanyQueries} from '../../../company-common/store/company.queries';
import {CompanyResource} from '../../../company-common/api/resources/company.resource';
import {FeatureToggleAction} from '../../../../feature-toggle/feature-toggle-common/store/feature-toggle.actions';
import {FeatureToggleQueries} from '../../../../feature-toggle/feature-toggle-common/store/feature-toggle.queries';
import {FeatureToggleResource} from '../../../../feature-toggle/feature-toggle-common/api/resources/feature-toggle.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {State} from '../../../../app.reducers';

@Component({
    selector: 'ss-company-detail-features',
    templateUrl: './company-detail-features.component.html',
    styleUrls: ['./company-detail-features.component.scss'],
    providers: [{provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: {disableToggleValue: 'noop'}}],

})
export class CompanyDetailFeaturesComponent implements OnInit, OnDestroy {

    public dataSource: MatTableDataSource<FeatureToggleResource> = new MatTableDataSource<FeatureToggleResource>();

    public displayedColumns = [
        'name',
        'status',
    ];

    public isLoading = false;

    public sliderColor: ThemePalette = 'primary';

    private _company: CompanyResource;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _companyQueries: CompanyQueries,
                private _featureToggleQueries: FeatureToggleQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleUpdate(feature: FeatureToggleResource): void {
        if (feature.whitelisted) {
            this._store.dispatch(new FeatureToggleAction.Delete.FeatureToggleBySubjectId(feature.name, feature.subjectId));
        } else {
            this._store.dispatch(
                new FeatureToggleAction.Set.FeatureToggleBySubjectId(feature.name, feature.subjectId, ObjectTypeEnum.Company));
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCurrentCompany()
                .pipe(
                    filter(company => !!company)
                )
                .subscribe(company => this._setCompany(company))
        );

        this._disposableSubscriptions.add(
            this._featureToggleQueries
                .observeFeatureTogglesBySubjectId(this._company.id)
                .subscribe(features => this._setCompanyFeatures(features))
        );

        this._disposableSubscriptions.add(
            this._featureToggleQueries.observeFeatureToggleListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );

        this._disposableSubscriptions.add(
            this._featureToggleQueries.observeFeatureToggleCurrentItemRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );
    }

    private _setCompany(company: CompanyResource): void {
        this._company = company;
        this._requestFeatureToggles();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setCompanyFeatures(features: FeatureToggleResource[]): void {
        this.dataSource = new MatTableDataSource<FeatureToggleResource>(features);
    }

    private _requestFeatureToggles(): void {
        this._store.dispatch(new FeatureToggleAction.Request.FeatureTogglesBySubjectId(this._company.id));
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }
}
