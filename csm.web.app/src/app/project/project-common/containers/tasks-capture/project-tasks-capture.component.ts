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
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../shared/misc/validation/generic.warnings';
import {DatepickerCalendarSelectionTypeEnum} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {InputDatepickerComponent} from '../../../../shared/ui/forms/input-datepicker/input-datepicker.component';
import {
    InputSelectDropdownComponent,
    SelectOption
} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {InputTextComponent} from '../../../../shared/ui/forms/input-text/input-text.component';
import {InputTextareaComponent} from '../../../../shared/ui/forms/input-textarea/input-textarea.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ProjectCompanyService} from '../../api/companies/project-company.service';
import {CompanyReferenceListResource} from '../../api/companies/resources/company-reference-list.resource';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectParticipantsService} from '../../api/participants/project-participants.service';
import {ProjectParticipantListResource} from '../../api/participants/resources/project-participant-list.resource';
import {
    SaveTaskResource,
    SaveTaskResourceWithVersions
} from '../../api/tasks/resources/save-task.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {Task} from '../../models/tasks/task';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export enum ProjectTaskCaptureFormInputEnum {
    Workarea = 'workarea',
    Company = 'company',
    StartDate = 'startDate',
    EndDate = 'endDate',
    Name = 'name',
    Description = 'description',
}

@Component({
    selector: 'ss-project-tasks-capture',
    templateUrl: './project-tasks-capture.component.html',
    styleUrls: ['./project-tasks-capture.component.scss'],
})
export class ProjectTasksCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Property with InputSelectDropdown component
     */
    @ViewChild('companyInput', {static: true})
    public companyInput: InputSelectDropdownComponent;

    /**
     * @description Property with InputSelectDropdown component
     */
    @ViewChild('workareaInput', {static: true})
    public workareaInput: InputSelectDropdownComponent;

    /**
     * @description Property with DatePicker component
     */
    @ViewChild('dateRangeInput', {static: true})
    public dateRangeInput: InputDatepickerComponent;

    /**
     * @description Property with task name view child
     */
    @ViewChild('nameInput', {static: true})
    public nameInput: InputTextComponent;

    /**
     * @description Property with task description view child
     */
    @ViewChild('description', {static: true})
    public description: InputTextareaComponent;

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public mode: CaptureModeEnum;

    /**
     * @description Property with information about default values
     * @type {boolean}
     */
    @Input()
    public hasDefaultValues = false;

    /**
     * @description Emits task name when edit is open
     * @type {EventEmitter<string>}
     */
    @Output()
    public taskName: EventEmitter<string> = new EventEmitter<string>();

    /**
     * @description Emits when the panel is closed
     * @type {EventEmitter<any>}
     */
    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter();

    /**
     * @description Emits when the form is to be submitted
     * @type {EventEmitter<SaveTaskResourceWithVersions>}
     */
    @Output()
    public onSubmit: EventEmitter<SaveTaskResourceWithVersions> = new EventEmitter<SaveTaskResourceWithVersions>();

    /**
     * @description Emits when the form is updated
     * @type {EventEmitter<SaveTaskResourceWithVersions>}
     */
    @Output()
    public onUpdate: EventEmitter<SaveTaskResourceWithVersions> = new EventEmitter<SaveTaskResourceWithVersions>();

    /**
     * @description Regex Pattern for file input
     * @type {RegExp}
     */
    public acceptedPattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    /**
     * @description inputFiles max image size
     * @type {number}
     */
    public imageMaxSize: number;

    /**
     * @description inputFiles max image size
     * @type {number}
     */
    public imageMaxSizeInMb: number;

    /**
     * @description Initialize form create
     */
    public form: UntypedFormGroup;

    /**
     * @description Property with form validations
     * @type {Object}
     */
    public validations: any = {
        name: {
            maxLength: 100,
        },
        location: {
            maxLength: 100,
        },
        description: {
            maxLength: 1000,
        },
    };

    /**
     * @description Property with craftList
     * @type {Array}
     */
    public craftList: SelectOption<CraftsOption>[] = [];

    /**
     * @description Property with workAreaList
     * @type {Array}
     */
    public workAreaList: SelectOption[] = [];

    /**
     * @description Property with companyList
     * @type {Array}
     */
    public companyList: SelectOption[] = [];

    /**
     * @description Property with personList
     * @type {Array}
     */
    public personList: SelectOption<ParticipantsOption>[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _defaultValues: ProjectFormData = {
        name: '',
        location: '',
        start: null,
        end: null,
        workarea: null,
        craft: null,
        company: null,
        person: null,
        description: '',
        files: [],
    };

    private _projectId: string;

    private _taskId: string;

    private _taskVersion: number;

    private _taskScheduleVersion: number;

    private _taskStatus: TaskStatusEnum;

    private _hasAssignPermission: boolean;

    private _hasUnassignPermission: boolean;

    constructor(private _attachmentHelper: AttachmentHelper,
                private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder,
                private _modalService: ModalService,
                private _participantService: ProjectParticipantsService,
                private _projectCompanyService: ProjectCompanyService,
                private _projectCraftQueries: ProjectCraftQueries,
                private _projectSliceService: ProjectSliceService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>,
                private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._setImageMaxSize();
        this._setProjectId();
        this._requestCrafts();
        this._requestCompanies();
        this._requestWorkareas();
        if (this.hasDefaultValues) {
            this._setDefaultValues();
        }
        this._setFocusOnCreate();
        this._setupForm();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Method called when form is submitted for assign
     */
    public onAssignAndSend(): void {
        const taskData: SaveTaskResource = this._getSubmitValue();

        this.onSubmit.emit(new SaveTaskResourceWithVersions(taskData, this._taskVersion, this._taskScheduleVersion));
    }

    /**
     * @description Method called when form is saved as draft
     */
    public onSaveAsDraft(): void {
        const taskData: SaveTaskResource = this._getSubmitValue();
        taskData.status = TaskStatusEnum.DRAFT;

        this.onSubmit.emit(new SaveTaskResourceWithVersions(taskData, this._taskVersion, this._taskScheduleVersion));
    }

    /**
     * @description Method called when form is update
     */
    public onClickUpdate(): void {
        const taskData: SaveTaskResource = this._getSubmitValue();
        taskData.status = this._taskStatus;

        this.onUpdate.emit(new SaveTaskResourceWithVersions(taskData, this._taskVersion, this._taskScheduleVersion));
    }

    /**
     * @description Method to check if task is in draft status
     * @returns {boolean}
     */
    public isTaskInDraftStatus(): boolean {
        return this._taskStatus === TaskStatusEnum.DRAFT;
    }

    /**
     * @description Handle cancel button
     */
    public handleCancel(): void {
        this._cancelForm();
    }

    /**
     * @description Method to be called to reset the form
     */
    public resetForm(): void {
        if (!this.form) {
            return;
        }

        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
        this._setDefaultCompany();
        this._setDefaultAssignee();
    }

    /**
     * @description Retrieve from current form state
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.form.valid;
    }

    /**
     * @description Handle if form is available for assign and send task
     * @returns {boolean}
     */
    public isFormAssignable(): boolean {
        return this.form.get('person').value && this.form.valid;
    }

    /**
     * @description Retrieve if the task must have an assignee to be updated
     * @returns {boolean}
     */
    public isAssignmentRequired(): boolean {
        return !this._hasUnassignPermission && (this._defaultValues.person !== null && this.mode === CaptureModeEnum.update);
    }

    /**
     * @description Define project capture current mode
     * @returns {string}
     */
    public getMode(): string {
        return this.mode === CaptureModeEnum.create ? 'create' : 'update';
    }

    private _setFocusOnCreate(): void {
        if (this.mode === CaptureModeEnum.create) {
            this._setInputFocus(ProjectTaskCaptureFormInputEnum.Name);
        }
    }

    private _cancelForm(): void {
        this.resetForm();
        this.onCancel.emit();
    }

    private _getSubmitValue(): SaveTaskResource {
        const {name, description, location, craft, workarea, range: {start, end}, person, files} = this.form.getRawValue();
        const status: TaskStatusEnum = TaskStatusEnum.OPEN;

        return new SaveTaskResource(
            this._projectId,
            name,
            description,
            status,
            location,
            craft ? craft.craftId : null,
            workarea,
            start,
            end,
            person ? person.id : null,
            files
        );
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectCraftQueries
                .observeCraftsSortedByName()
                .subscribe(crafts => this._parseCrafts(crafts))
        );

        if (this.mode === CaptureModeEnum.update) {
            this._disposableSubscriptions.add(
                this._projectTaskQueries
                    .observeTaskById(this._modalService.currentModalData.taskId)
                    .pipe(
                        first()
                    )
                    .subscribe(task => {
                        this._setTaskToEdit(task);
                        this._setInputFocus(this._modalService.currentModalData.focus);
                    })
            );
        }

        this._disposableSubscriptions.add(
            this._workAreaQueries
                .observeWorkareas()
                .subscribe(workAreas => this._parseWorkAreas(workAreas))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            name: [this._defaultValues.name,
                [GenericValidators.isRequired(),
                    GenericValidators.isMaxLength(this.validations.name.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.name.maxLength)]],
            location: [this._defaultValues.location,
                [GenericValidators.isMaxLength(this.validations.location.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.location.maxLength)]],
            range: [{
                start: this._defaultValues.start,
                end: this._defaultValues.end,
            }, [
                GenericValidators.isValidDate(),
                GenericValidators.isValidRange(),
            ]],
            workarea: [this._defaultValues.workarea],
            craft: [this._defaultValues.craft,
                [GenericValidators.isRequired()]],
            company: [null],
            person: [null],
            description: [this._defaultValues.description,
                [GenericValidators.isMaxLength(this.validations.description.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.description.maxLength)]],
            files: [this._defaultValues.files],
        });

        if (this.isAssignmentRequired()) {
            this.form.get('company').setValidators(GenericValidators.isRequired());
            this.form.get('person').setValidators(GenericValidators.isRequired());
        }

        this.form.get('person').disable();
        this._subscribeCompanyChange();
    }

    private _subscribeCompanyChange(): void {
        this._disposableSubscriptions.add(
            this.form.get('company').valueChanges
                .subscribe(companyId => {
                    const participantControl = this.form.get('person');
                    participantControl.reset();

                    if (companyId !== null) {
                        this._clearPersonList();
                        this._enablePersonControl();
                        this._requestParticipants(companyId);
                    } else if (this._defaultValues.company === null) {
                        participantControl.disable();
                    }
                }));
    }

    private _enablePersonControl() {
        if (this._canEnablePersonControl()) {
            this.form.get('person').enable();
        }
    }

    private _clearPersonList(): void {
        this.personList = [];
    }

    private _setImageMaxSize(): void {
        this.imageMaxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.imageMaxSize = this._attachmentHelper.convertMbToBytes(this.imageMaxSizeInMb);
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

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _requestWorkareas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
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
        this.personList = participants.items.map(participant => {
            const {id, user: {picture, displayName}} = participant;

            return this._getParticipantOptions(id, displayName, picture);
        });
    }

    private _parseCrafts(crafts: ProjectCraftResource[]): void {
        this.craftList = crafts.map((craft: ProjectCraftResource) => {
            const {id, name, color} = craft;

            return this._getCraftOptions(id, name, color);
        });
    }

    private _getCraftOptions(craftId: string, label: string, color: string): SelectOption<CraftsOption> {
        return {
            label,
            value: {
                color,
                craftId,
            },
        };
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

    private _parseWorkAreas(workAreas: WorkareaResource[]): void {
        const workareaFormField = this.form.get('workarea');

        if (workAreas.length) {
            workareaFormField.enable();
        } else {
            workareaFormField.disable();
        }

        this.workAreaList = workAreas.map((workarea: WorkareaResource) => {
            const {id, name, position} = workarea;

            return {
                label: `${position}. ${name}`,
                value: id,
            };
        });
    }

    private _setTaskToEdit(task: Task): void {
        if (typeof task === 'undefined') {
            return;
        }

        const {permissions, id, name, project, status} = task;

        this.taskName.emit(name);
        this._hasAssignPermission = permissions.canAssign;
        this._hasUnassignPermission = permissions.canUnassign;
        this._projectId = project.id;
        this._taskId = id;
        this._taskStatus = status;
        this._setDefaultCaptureValues(task);
        this._setupForm();

        if (this._defaultValues.company && this._defaultValues.person) {
            this._setDefaultCompany();
            this._setDefaultAssignee();
        }

        if (!this._hasAssignPermission) {
            this._disableAssignment();
        }

    }

    private _setDefaultCaptureValues(task: Task): void {
        const {name, description, location, projectCraft, company, assignee, workArea, schedule, version} = task;

        this._defaultValues = {
            name,
            description: this._getDefaultValue(description),
            location: this._getDefaultValue(location),
            craft: this._getCraftOptions(projectCraft.id, projectCraft.name, projectCraft.color).value,
            workarea: this._getDefaultIdValue(workArea),
            company: this._getDefaultIdValue(company),
            start: schedule && schedule.start ? moment(schedule.start) : null,
            end: schedule && schedule.end ? moment(schedule.end) : null,
            person: assignee ? this._getParticipantOptions(assignee.id, assignee.displayName, assignee.picture).value : null,
            files: null,
        };

        this._taskVersion = version;
        this._taskScheduleVersion = schedule ? schedule.version : null;

        this.resetForm();
    }

    private _getDefaultValue(value: string): string | null {
        return value || null;
    }

    private _getDefaultIdValue(value: { id: string }): string | null {
        return value ? value.id : null;
    }

    private _setInputFocus(focus: ProjectTaskCaptureFormInputEnum) {
        switch (focus) {
            case ProjectTaskCaptureFormInputEnum.Name: {
                this.nameInput.setFocus();
                break;
            }
            case ProjectTaskCaptureFormInputEnum.Workarea: {
                this.workareaInput.setFocus();
                break;
            }
            case ProjectTaskCaptureFormInputEnum.Company: {
                this.companyInput.setFocus();
                break;
            }
            case ProjectTaskCaptureFormInputEnum.StartDate: {
                this.dateRangeInput.setFocus(DatepickerCalendarSelectionTypeEnum.StartDate);
                break;
            }
            case ProjectTaskCaptureFormInputEnum.EndDate: {
                this.dateRangeInput.setFocus(DatepickerCalendarSelectionTypeEnum.EndDate);
                break;
            }
            case ProjectTaskCaptureFormInputEnum.Description: {
                this.description.setFocus();
                break;
            }
            default:
                break;
        }
    }

    private _setDefaultValues(): void {
        this._defaultValues = {...this._defaultValues, ...this._modalService.currentModalData};
    }

    private _disableAssignment(): void {
        this.form.get('company').disable({emitEvent: false});
        this.form.get('person').disable();
    }

    private _setDefaultAssignee(): void {
        this.form.get('person').setValue(this._getSelectedPerson());
    }

    private _setDefaultCompany(): void {
        this.form.get('company').setValue(this._getSelectedCompany());
    }

    private _getSelectedPerson(): ParticipantsOption {
        let person: ParticipantsOption = null;

        if (this._isSelectedPersonOnList()) {
            person = this._defaultValues.person;
        } else if (this._hasOnlyOnePersonOption()) {
            person = this.personList[0].value;
        }

        return person;
    }

    private _getSelectedCompany(): string {
        let company: string = null;

        if (this._isSelectedCompanyOnList()) {
            company = this._defaultValues.company;
        }

        return company;
    }

    private _hasOnlyOnePersonOption() {
        return this.form.get('company').value && this.personList.length === 1;
    }

    private _isSelectedCompanyOnList(): boolean {
        return !!this.companyList.find(company => company.value === this._defaultValues.company);
    }

    private _isSelectedPersonOnList(): boolean {
        return !!this._defaultValues.person && !!this.personList.find(person => person.value.id === this._defaultValues.person.id);
    }

    private _canEnablePersonControl(): boolean {
        return this.form.get('company').value;
    }
}

export interface ProjectFormData {
    name: string;
    location: string;
    start: moment.Moment;
    end: moment.Moment;
    workarea: string;
    craft: CraftsOption;
    company: string;
    person: ParticipantsOption;
    description: string;
    files: any;
}

export interface CraftsOption {
    color: string;
    craftId: string;
}

export interface ParticipantsOption {
    picture: string;
    id: string;
}
