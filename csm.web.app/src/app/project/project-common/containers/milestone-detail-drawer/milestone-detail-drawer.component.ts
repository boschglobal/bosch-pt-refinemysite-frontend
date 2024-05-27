/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {ButtonStyle} from '../../../../shared/ui/button/button.component';
import {
    DRAWER_DATA,
    DrawerService,
} from '../../../../shared/ui/drawer/api/drawer.service';
import {
    MenuItem,
    MenuItemsList
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../store/participants/project-participant.queries';
import {RelationQueries} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {DependenciesListRelationsObservables} from '../dependencies-list/dependencies-list.component';

export const CSS_CLASSES_MILESTONE_DETAIL_DRAWER: { [key in MilestoneTypeEnum]: string } = {
    [MilestoneTypeEnum.Craft]: 'ss-milestone-detail-drawer--craft',
    [MilestoneTypeEnum.Investor]: 'ss-milestone-detail-drawer--investor',
    [MilestoneTypeEnum.Project]: 'ss-milestone-detail-drawer--project',
};
export const BUTTON_STYLE_MILESTONE_DETAIL_DRAWER: { [key in MilestoneTypeEnum]: ButtonStyle } = {
    [MilestoneTypeEnum.Craft]: 'inverted',
    [MilestoneTypeEnum.Investor]: 'inverted-grey',
    [MilestoneTypeEnum.Project]: 'inverted',
};
export const DELETE_MILESTONE_ITEM_ID = 'delete-milestone';

@Component({
    selector: 'ss-milestone-detail-drawer',
    templateUrl: './milestone-detail-drawer.component.html',
    styleUrls: ['./milestone-detail-drawer.component.scss'],
})
export class MilestoneDetailDrawerComponent implements OnInit, OnDestroy {

    public buttonStyle: ButtonStyle = 'inverted';

    public creatorParticipant: ProjectParticipantResource;

    public drawerClass: string;

    public dropdownItems: MenuItemsList[] = [];

    public milestone: Milestone;

    public dependencyOriginator = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, this._milestoneId);

    public relationsObservables: DependenciesListRelationsObservables = {
        requestStatusObservable: this._relationsQueries.observeFinishToStartRelationsRequestStatus(),
        predecessorsObservable: this._relationsQueries.observeFinishToStartPredecessorRelationsByMilestoneId(this._milestoneId),
        predecessorsWithResourcesObservable: this._relationsQueries.observeRelationsMilestonePredecessorsByMilestoneId(this._milestoneId),
        successorsObservable: this._relationsQueries.observeFinishToStartSuccessorRelationsByMilestoneId(this._milestoneId),
        successorsWithResourcesObservable: this._relationsQueries.observeRelationsMilestoneSuccessorsByMilestoneId(this._milestoneId),
    };

    public workArea: WorkareaResource;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(
        private _drawerService: DrawerService,
        @Inject(DRAWER_DATA) private _milestoneId: string,
        private _milestoneQueries: MilestoneQueries,
        private _modalService: ModalService,
        private _projectParticipantQueries: ProjectParticipantQueries,
        private _relationsQueries: RelationQueries,
        private _router: Router,
        private _store: Store<State>,
        private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleClose(): void {
        this._drawerService.close();
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_MILESTONE_ITEM_ID:
                this._handleDelete();
                break;
        }
    }

    public handleUpdate(focus: string = null): void {
        this._modalService.open({
            id: ModalIdEnum.UpdateMilestone,
            data: {
                milestoneId: this._milestoneId,
                focus,
            },
        });
    }

    public navigateToUserProfile(): void {
        const {project: {id: projectId}, id} = this.creatorParticipant;

        this._router.navigateByUrl(ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, id));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._milestoneQueries.observeMilestoneById(this._milestoneId)
                .subscribe(milestone => {
                    if (milestone) {
                        this._setMilestone(milestone);
                        this._setDropdownItems();
                        this._requestParticipant();
                        this._setStyles();
                    } else {
                        this.handleClose();
                    }
                }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setMilestone(milestone: Milestone): void {
        this.milestone = milestone;

        this._setWorkAreaSubscription();
    }

    private _requestParticipant(): void {
        const {id} = this.milestone.creator;

        this._store.dispatch(new ProjectParticipantActions.Request.One(id));

        this._setParticipantSubscription(id);
    }

    private _setParticipant(participant: ProjectParticipantResource): void {
        this.creatorParticipant = participant;
    }

    private _setParticipantSubscription(id: string): void {
        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeProjectParticipantById(id)
                .subscribe(participant => this._setParticipant(participant))
        );
    }

    private _setDropdownItems(): void {
        const items: MenuItemsList[] = [];

        if (this.milestone.permissions.canDelete) {
            items.push({
                items: [{
                    id: DELETE_MILESTONE_ITEM_ID,
                    label: 'Milestone_Delete_Label',
                    type: 'button',
                }],
            });
        }

        this.dropdownItems = items;
    }

    private _setWorkAreaSubscription(): void {

        const {workArea} = this.milestone;

        if (workArea) {
            this._disposableSubscriptions.add(
                this._workAreaQueries.observeWorkareaById(workArea.id)
                    .subscribe((workAreaValue) => this.workArea = workAreaValue)
            );
        }
    }

    private _handleDelete(): void {
        const {id, version} = this.milestone;

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Milestone_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new MilestoneActions.Delete.One(id, version)),
                cancelCallback: () => this._store.dispatch(new MilestoneActions.Delete.OneReset()),
                completeCallback: () => this.handleClose(),
                requestStatusObservable: this._milestoneQueries.observeCurrentMilestoneRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _setStyles(): void {
        this.drawerClass = CSS_CLASSES_MILESTONE_DETAIL_DRAWER[this.milestone.type];
        this.buttonStyle = BUTTON_STYLE_MILESTONE_DETAIL_DRAWER[this.milestone.type];
    }
}
