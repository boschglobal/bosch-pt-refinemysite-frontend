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
    OnInit,
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {FlyoutModel} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {SelectListOption} from '../../../../../shared/ui/select-list/select-list.component';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectParticipantFilters} from '../../../../project-common/store/participants/slice/project-participant-filters';
import {
    PARTICIPANT_TOOLBAR_FILTER_ENUM_HELPER,
    ParticipantToolbarFilterEnum
} from '../../enums/participant-toolbar-filter.enum';
import {ProjectParticipantsSortingComponent} from '../../presentationals/participants-sorting/project-participants-sorting.component';
import {ProjectParticipantsCaptureComponent} from '../participants-capture/project-participants-capture.component';

@Component({
    selector: 'ss-project-participants',
    templateUrl: './project-participants.component.html',
    styleUrls: ['./project-participants.component.scss'],
})
export class ProjectParticipantsComponent implements OnInit, OnDestroy {

    @ViewChild('participantInviteCapture')
    public participantInviteCapture: ProjectParticipantsCaptureComponent;

    public hasInvitePermission: boolean;

    public isSortingFlyoutOpen: boolean;

    public showParticipantInviteCapture = false;

    public sortFlyout: FlyoutModel = {
        component: ProjectParticipantsSortingComponent,
        id: 'ParticipantsSorting',
        closeKeyTriggers: [KeyEnum.Escape],
    };

    public toolbarFilterOptions: SelectListOption[] = PARTICIPANT_TOOLBAR_FILTER_ENUM_HELPER.getSelectOptions().map(({label, value}) => ({
        value,
        id: value,
        displayName: label,
    }));

    public selectedToolbarFilterOption: SelectListOption = this.toolbarFilterOptions[0];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _flyoutService: FlyoutService,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _store: Store<State>) {
    }

    public ngOnInit() {
        this._setListFilters();
        this._setSubscriptions();
    }

    public ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleToolbarFilterChange(option: SelectListOption): void {
        switch (option.id) {
            case ParticipantToolbarFilterEnum.ALL: {
                const filters = {status: ProjectParticipantFilters.getAllParticipantStatus()};
                this._store.dispatch(new ProjectParticipantActions.Set.ListFilters(filters));
                break;
            }
            case ParticipantToolbarFilterEnum.ACTIVE: {
                const filters = {status: ProjectParticipantFilters.getActiveParticipantStatus()};
                this._store.dispatch(new ProjectParticipantActions.Set.ListFilters(filters));
                break;
            }
            case ParticipantToolbarFilterEnum.PENDING: {
                const filters = {status: ProjectParticipantFilters.getParticipantPendingStatus()};
                this._store.dispatch(new ProjectParticipantActions.Set.ListFilters(filters));
                break;
            }
        }
    }

    public closeInviteParticipantCapture(): void {
        this.showParticipantInviteCapture = false;
    }

    public toggleInviteParticipantCapture(): void {
        this.showParticipantInviteCapture = !this.showParticipantInviteCapture;

        if (this.showParticipantInviteCapture) {
            this.participantInviteCapture.setFocus();
        } else {
            this.participantInviteCapture.handleCancel();
        }
    }

    public toggleSortFlyout(): void {
        if (this.isSortingFlyoutOpen) {
            this._flyoutService.close(this.sortFlyout.id);
        } else {
            this.isSortingFlyoutOpen = true;
            this.showParticipantInviteCapture = false;
            this._flyoutService.open(this.sortFlyout.id);
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeInviteProjectParticipantPermission()
                .subscribe(this._setInvitePermission.bind(this))
        );
        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents.pipe(
                filter(flyoutId => flyoutId === this.sortFlyout.id)
            ).subscribe(() => this.isSortingFlyoutOpen = false)
        );
    }

    private _setInvitePermission(permission: boolean): void {
        this.hasInvitePermission = permission;
    }

    private _setListFilters(): void {
        const filters = {status: ProjectParticipantFilters.getAllParticipantStatus()};
        this._store.dispatch(new ProjectParticipantActions.Set.ListFilters(filters));
    }
}
