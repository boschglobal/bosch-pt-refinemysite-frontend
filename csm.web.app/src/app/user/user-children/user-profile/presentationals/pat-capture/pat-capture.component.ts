/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {PATScope} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../shared/misc/validation/generic.warnings';
import {InputMultipleSelectOption} from '../../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {InputTextComponent} from '../../../../../shared/ui/forms/input-text/input-text.component';
import {PatScopeEnum} from '../../../../user-common/enums/pat.enum';
import {
    PATExpirationEnum,
    patExpirationEnumHelper
} from '../../../../user-common/enums/patExpiration.enum';

export const PAT_FORM_DEFAULT_VALUE: PATFormData = {
    description: '',
    expiresAt: null,
    scope: [],
};

@Component({
    selector: 'ss-pat-capture',
    templateUrl: './pat-capture.component.html',
    styleUrls: ['./pat-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue(value: PATFormData) {
        this._setFormValue(value || PAT_FORM_DEFAULT_VALUE);
    }

    @Input()
    public set mode(value: CaptureModeEnum) {
        this._setSubmitButtonLabel(value);
    }

    @Output()
    public canceled: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public submitted: EventEmitter<PATFormData> = new EventEmitter<PATFormData>();

    @ViewChild('nameInput', {static: true})
    public nameInput: InputTextComponent;

    public submitButtonLabel: string;

    public readonly expiresAtList: SelectOption[] = patExpirationEnumHelper.getSelectOptions();

    public readonly scopeList: InputMultipleSelectOption[] = Object.keys(PatScopeEnum)
        .map(key => ({id: key, text: PatScopeEnum[key]}))
        .sort((a, b) => a.text < b.text ? -1 : 1);

    public readonly validations = {
        description: {
            maxLength: 100,
        },
    };

    public readonly form = this._formBuilder.group({
        description: new FormControl(PAT_FORM_DEFAULT_VALUE.description, [
            GenericValidators.isMaxLength(this.validations.description.maxLength),
            GenericWarnings.isCharLimitReached(this.validations.description.maxLength),
            GenericValidators.isRequired(),
        ]),
        expiresAt: new FormControl(PAT_FORM_DEFAULT_VALUE.expiresAt, [
            GenericValidators.isRequired(),
        ]),
        scope: new FormControl(PAT_FORM_DEFAULT_VALUE.scope, [
            GenericValidators.isRequired(),
        ]),
    });

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._setFocusInputText();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleCancel(): void {
        this.canceled.emit();
    }

    public handleSubmit(): void {
        const value = this.form.value as PATFormData;

        this.submitted.emit(value);
    }

    private _setFocusInputText(): void {
        this.nameInput.setFocus();
    }

    private _setFormValue(value: PATFormData): void {
        this.form.setValue(value);
    }

    private _setSubmitButtonLabel(mode: CaptureModeEnum): void {
        this.submitButtonLabel = mode === CaptureModeEnum.create ? 'Generic_Create' : 'Generic_Update';
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.statusChanges
                .pipe(distinctUntilChanged())
                .subscribe(() => this._changeDetectorRef.detectChanges())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface PATFormData {
    description: string;
    expiresAt: PATExpirationEnum;
    scope: PATScope[];
}
