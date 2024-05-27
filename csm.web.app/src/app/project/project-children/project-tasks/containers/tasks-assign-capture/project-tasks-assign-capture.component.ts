/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectCompanyService} from '../../../../project-common/api/companies/project-company.service';
import {CompanyReferenceListResource} from '../../../../project-common/api/companies/resources/company-reference-list.resource';
import {ProjectParticipantsService} from '../../../../project-common/api/participants/project-participants.service';
import {ProjectParticipantListResource} from '../../../../project-common/api/participants/resources/project-participant-list.resource';
import {ParticipantsOption} from '../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-project-tasks-assign-capture',
    templateUrl: './project-tasks-assign-capture.component.html',
    styleUrls: ['./project-tasks-assign-capture.component.scss'],
})

export class ProjectTasksAssignCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Initialize form assign
     */
    public tasksAssignForm: UntypedFormGroup;

    /**
     * @description Information about submitting status
     */
    public isSubmitting = false;
    /**
     * @description Property with company list
     * @type {Array}
     */
    public companyList: SelectOption[] = [];
    /**
     * @description Property with participant list
     * @type {Array}
     */
    public participantList: SelectOption<ParticipantsOption>[] = [];
    /**
     * @description Number of selected tasks
     * @type {number}
     */
    public selectedTasksNumber = 0;
    /**
     * @description List of selected tasks ids
     * @type {Array}
     */
    public selectedTasks: string[] = [];
    /**
     * @description Output property triggered when capture is closed
     * @type {EventEmitter<void>}
     */
    @Output() public onClose: EventEmitter<void> = new EventEmitter<void>();
    /**
     * @description Output property triggered when capture is opened
     * @type {EventEmitter<void>}
     */
    @Output() public onOpen: EventEmitter<void> = new EventEmitter<void>();
    private _disposableSubscriptions: Subscription = new Subscription();
    private _projectId: string;

    constructor(private _formBuilder: UntypedFormBuilder,
                private _projectCompanyService: ProjectCompanyService,
                private _participantService: ProjectParticipantsService,
                private _projectSliceService: ProjectSliceService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    /**
     * @description Sets isSelecting state
     * @param {boolean} isSelecting
     */
    @Input()
    public set isSelecting(isSelecting: boolean) {
        if (isSelecting) {
            this._store.dispatch(new ProjectTaskActions.Set.AssignSelecting(true));
        }
    }

    ngOnInit() {
        this._setupForm();
        this._setSubscriptions();
        this._setProjectId();
        this._requestCompanies();
    }

    ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
        this._store.dispatch(new ProjectTaskActions.Initialize.Assignment());
    }

    /**
     * @description Retrieve the current form status
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.tasksAssignForm.valid && !!this.selectedTasksNumber;
    }

    /**
     * @description Handle cancel tab button
     */
    public handleCancel(): void {
        this._resetForm();
        this.onClose.emit();
        this._store.dispatch(new ProjectTaskActions.Initialize.Assignment());
    }

    /**
     * @description Called when click submit button
     */
    public onSubmitForm(): void {
        const {company, participant} = this.tasksAssignForm.value;
        const payload = {taskIds: this.selectedTasks, companyId: company, participantId: participant?.id};
        this._store.dispatch(new ProjectTaskActions.Assign.All(payload));
    }

    private _subscribeCompanyChange(): void {
        this._disposableSubscriptions.add(
            this.tasksAssignForm.get('company').valueChanges
                .subscribe(companyId => {
                    const participantControl = this.tasksAssignForm.get('participant');
                    if (companyId === null) {
                        participantControl.disable();
                    } else {
                        participantControl.enable();
                        this._requestParticipants(companyId);
                    }
                    participantControl.reset();
                }
                )
        );
    }

    private _resetForm(): void {
        this.tasksAssignForm.reset();
        this.tasksAssignForm.updateValueAndValidity();
        this._setDefaultCompany();
        this._setDefaultAssignee();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeTaskAssignList()
                .subscribe(this._parseAssignList.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeTaskAssignListRequestStatus()
                .subscribe(this._handleCaptureState.bind(this))
        );
    }

    private _setProjectId(): void {
        this._projectId = this._projectSliceService.getCurrentProject().id;
    }

    private _requestCompanies(): void {
        this._disposableSubscriptions.add(
            this._projectCompanyService.findAll(this._projectId)
                .subscribe((companyReferenceListResource: CompanyReferenceListResource) => {
                    this._parseCompanies(companyReferenceListResource);
                    this._setDefaultCompany();
                })
        );
    }

    private _requestParticipants(companyId: string): void {
        const participantColumn = 'user';
        const order = 'asc';

        this._disposableSubscriptions.add(
            this._participantService.findAllByCompany(this._projectId, companyId, participantColumn, order)
                .subscribe((participantList: ProjectParticipantListResource) => {
                    this._parseParticipants(participantList);
                    this._setDefaultAssignee();
                })
        );
    }

    private _parseAssignList(assignList: AbstractSelectionList): void {
        this.selectedTasksNumber = assignList.ids.length;
        this.selectedTasks = assignList.ids;

        if (assignList.isSelecting) {
            this.onOpen.emit();
        }
    }

    private _parseCompanies(companyList: CompanyReferenceListResource): void {
        this.companyList = companyList.companies.map(company => {
            const {id, displayName} = company;
            return {
                label: displayName,
                value: id,
            };
        });
    }

    private _parseParticipants(participants: ProjectParticipantListResource): void {
        this.participantList = participants.items.map(participant => {
            const {id, user: {picture, displayName}} = participant;

            return this._getParticipantOptions(id, displayName, picture);
        });
    }

    private _setupForm(): void {
        this.tasksAssignForm = this._formBuilder.group({
            company: [null, [
                GenericValidators.isRequired(),
            ]],
            participant: [null, [
                GenericValidators.isRequired(),
            ]],
        });

        this.tasksAssignForm.get('participant').disable({onlySelf: true});
        this._subscribeCompanyChange();
    }

    private _setDefaultCompany(): void {
        if (this.companyList.length === 1) {
            this.tasksAssignForm.get('company').setValue(this.companyList[0].value);
        }
    }

    private _setDefaultAssignee(): void {
        if (this.tasksAssignForm.get('company').value && this.participantList.length === 1) {
            this.tasksAssignForm.get('participant').enable();
            this.tasksAssignForm.get('participant').setValue(this.participantList[0].value);
        }
    }

    private _getParticipantOptions(id: string, label: string, picture: string): SelectOption<ParticipantsOption> {
        return {
            label,
            value: {
                id,
                picture,
            },
        };
    }

    private _handleCaptureState(captureStatus: RequestStatusEnum): void {
        switch (captureStatus) {
            case RequestStatusEnum.success:
                this.handleCancel();
                this.isSubmitting = false;
                break;
            case RequestStatusEnum.progress:
                this.isSubmitting = true;
                break;
            case RequestStatusEnum.error:
                this.isSubmitting = false;
                break;
        }
    }
}
