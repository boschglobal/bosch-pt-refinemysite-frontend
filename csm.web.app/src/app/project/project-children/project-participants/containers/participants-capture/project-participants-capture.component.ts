/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {
    select,
    Store
} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../shared/misc/validation/generic.warnings';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {InputTextComponent} from '../../../../../shared/ui/forms/input-text/input-text.component';
import {
    ParticipantRoleEnum,
    ParticipantRoleEnumHelper
} from '../../../../project-common/enums/participant-role.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';

@Component({
    selector: 'ss-project-participants-capture',
    templateUrl: './project-participants-capture.component.html',
    styleUrls: ['./project-participants-capture.component.scss'],
})
export class ProjectParticipantsCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Property with email input view child
     */
    @ViewChild('emailInput', {static: true})
    public emailInput: InputTextComponent;

    /**
     * @description Property with all participant roles
     * @type {Array}
     */
    public roleList: SelectOption[] = ParticipantRoleEnumHelper.getSelectOptions();

    /**
     * @description Output property triggered when capture is closed
     * @type {EventEmitter<any>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter();

    /**
     * @description Initialize form capture
     */
    public participantsCaptureForm: UntypedFormGroup;

    /**
     * @description Information about submitting status
     */
    public isSubmitting = false;

    private _roleDefaultValue = ParticipantRoleEnum.FM;

    private _participantsSubscription: Subscription;

    public validations: any = {
        email: {
            maxLength: 254
        }
    };

    constructor(private _activatedRoute: ActivatedRoute,
                private _formBuilder: UntypedFormBuilder,
                private _participantsQueries: ProjectParticipantQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setupForm();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Dispatch post participant action if form is valid
     */
    public onSubmitForm(): void {
        if (!this.isFormValid()) {
            return;
        }
        const payload: any = {
            email: this.participantsCaptureForm.value.email,
            role: this.participantsCaptureForm.value.role,
            projectId: this._getProjectId()
        };
        this._store.dispatch(new ProjectParticipantActions.Create.One(payload));
    }

    /**
     * @description Retrieve the current form status
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.participantsCaptureForm.valid;
    }

    /**
     * @description Handle cancel tab button
     */
    public handleCancel(): void {
        this._resetForm();
        this.onClose.emit();
    }

    /**
     * @description Method called to set focus on input
     */
    public setFocus(): void {
        this.emailInput.setFocus();
    }

    private _setSubscriptions(): void {
        this._participantsSubscription = this._store
            .pipe(
                select(this._participantsQueries.getCurrentItemRequestStatus()))
            .subscribe(data => this._handleCaptureState(data));
    }

    private _unsetSubscriptions(): void {
        this._participantsSubscription.unsubscribe();
    }

    private _handleCaptureState(captureStatus: RequestStatusEnum): void {
        switch (captureStatus) {
            case RequestStatusEnum.success:
                this._resetForm();
                this.onClose.emit();
                this.isSubmitting = false;
                this._store.dispatch(new ProjectParticipantActions.Request.Page());
                break;
            case RequestStatusEnum.progress:
                this.isSubmitting = true;
                break;
            case RequestStatusEnum.error:
                this.isSubmitting = false;
                break;
        }
    }

    private _setupForm(): void {
        this.participantsCaptureForm = this._formBuilder.group({
            email: ['', [
                GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.validations.email.maxLength),
                GenericWarnings.isCharLimitReached(this.validations.email.maxLength)]],
            role: [this._roleDefaultValue, [GenericValidators.isRequired()]],
        });
    }

    private _resetForm(): void {
        this.participantsCaptureForm.reset({role: this._roleDefaultValue});
        this.participantsCaptureForm.updateValueAndValidity();
        this._store.dispatch(new ProjectParticipantActions.Create.OneReset());
    }

    private _getProjectId(): string {
        return this._activatedRoute.root.firstChild.snapshot.children[0].params[ROUTE_PARAM_PROJECT_ID];
    }
}
