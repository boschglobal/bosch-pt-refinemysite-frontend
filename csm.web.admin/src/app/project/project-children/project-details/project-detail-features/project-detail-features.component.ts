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

import {FeatureToggleAction} from '../../../../feature-toggle/feature-toggle-common/store/feature-toggle.actions';
import {FeatureToggleQueries} from '../../../../feature-toggle/feature-toggle-common/store/feature-toggle.queries';
import {FeatureToggleResource} from '../../../../feature-toggle/feature-toggle-common/api/resources/feature-toggle.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {ProjectQueries} from '../../../project-common/store/project.queries';
import {ProjectResource} from '../../../project-common/api/resources/project.resource';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {State} from '../../../../app.reducers';

@Component({
    selector: 'ss-project-detail-features',
    templateUrl: './project-detail-features.component.html',
    styleUrls: ['./project-detail-features.component.scss'],
    providers: [{provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: {disableToggleValue: 'noop'}}],

})
export class ProjectDetailFeaturesComponent implements OnInit, OnDestroy {

    public dataSource: MatTableDataSource<FeatureToggleResource> = new MatTableDataSource<FeatureToggleResource>();

    public displayedColumns = [
        'name',
        'status',
    ];

    public isLoading = false;

    public sliderColor: ThemePalette = 'primary';

    private _disposableSubscriptions: Subscription = new Subscription();

    private _project: ProjectResource;

    constructor(private _featureToggleQueries: FeatureToggleQueries,
                private _projectQueries: ProjectQueries,
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
                new FeatureToggleAction.Set.FeatureToggleBySubjectId(feature.name, feature.subjectId, ObjectTypeEnum.Project));
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectQueries
                .observeCurrentProject()
                .subscribe(project => this._setProject(project))
        );

        this._disposableSubscriptions.add(
            this._featureToggleQueries
                .observeFeatureTogglesBySubjectId(this._project.id)
                .subscribe(features => this._setProjectFeatures(features))
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

    private _setProject(project: ProjectResource): void {
        this._project = project;
        this._requestFeatureToggles();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setProjectFeatures(features: FeatureToggleResource[]): void {
        this.dataSource.data = features;
    }

    private _requestFeatureToggles(): void {
        this._store.dispatch(new FeatureToggleAction.Request.FeatureTogglesBySubjectId(this._project.id));
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }
}
