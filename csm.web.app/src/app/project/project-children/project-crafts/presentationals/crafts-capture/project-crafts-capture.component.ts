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
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
} from '@angular/forms';

import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../shared/misc/validation/generic.warnings';
import {CRAFT_COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {InputAutocompleteComponent} from '../../../../../shared/ui/forms/input-autocomplete/input-autocomplete.component';

export interface ProjectCraftsCapture {
    color: string;
    name: string;
    position: number;
}

export const PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE: ProjectCraftsCapture = {
    name: '',
    color: null,
    position: null,
};

@Component({
    selector: 'ss-project-crafts-capture',
    templateUrl: './project-crafts-capture.component.html',
    styleUrls: ['./project-crafts-capture.component.scss'],
})
export class ProjectCraftsCaptureComponent implements OnInit {

    @ViewChild('craftInput', {static: true})
    public craftInput: InputAutocompleteComponent;

    @Input()
    public crafts: string[];

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public mode: CaptureModeEnum;

    @Input()
    public set defaultValues(defaultValues: ProjectCraftsCapture) {
        this._defaultValues = defaultValues;
        this._defaultValues.color = this._getColor();
        this.position = this._defaultValues.position;

        this._setFormValue(defaultValues || PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE);
        this.form.updateValueAndValidity();
    }

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public onSubmit: EventEmitter<ProjectCraftsCapture> = new EventEmitter<ProjectCraftsCapture>();

    public craftColors: string[] = CRAFT_COLORS.map(color => color.solid);

    public isUpdateMode: boolean;

    public minStep = 1;

    public position: number;

    public validations: any = {
        name: {
            maxLength: 100,
        },
    };

    public readonly form = this._formBuilder.group({
        name: new FormControl(PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE.name, [
            GenericValidators.isRequired(),
            GenericValidators.isMaxLength(this.validations.name.maxLength),
            GenericWarnings.isCharLimitReached(this.validations.name.maxLength)]),
        color: new FormControl(PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE.color, [
            GenericValidators.isRequired()]),
        position: new FormControl(PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE.position, [
            GenericValidators.isRequired(),
            this._validatorFn.bind(this)]),
    });

    private _defaultValues: ProjectCraftsCapture;

    private _elementStyles: { [element in ProjectCraftsCaptureElement]: { [mode in ProjectCraftsCaptureMode]: string } } = {
        input: {
            regular: 'ss-project-crafts-capture__inputs col-md-12 col-lg-6 col-xl-6',
            edit: 'ss-project-crafts-capture__inputs--edit col-md-12 col-lg-6 col-xl-4',
        },
        button: {
            regular: 'ss-project-crafts-capture__buttons ss-button-group col-sm-12',
            edit: 'ss-project-crafts-capture__buttons--edit ss-button-group col-md-12 col-lg-6 col-xl-8',
        },
        capture: {
            regular: 'ss-project-crafts-capture',
            edit: 'ss-project-crafts-capture--edit',
        },
    };

    constructor(private _formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this._setupIsUpdateMode();
    }

    public getElementStyles(element: ProjectCraftsCaptureElement): string {
        return this._isEditMode() ? this._elementStyles[element].edit : this._elementStyles[element].regular;
    }

    public handleSubmit(): void {
        const value: ProjectCraftsCapture = this.form.value as ProjectCraftsCapture;
        this.onSubmit.emit(value);
    }

    public handleCancel(): void {
        this.onCancel.emit();
    }

    public resetForm(): void {
        this.form.reset();
        this.form.updateValueAndValidity();
        this._setFormValue(PROJECT_CRAFTS_CAPTURE_DEFAULT_VALUE);
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public getSubmitKey(): string {
        return this._isEditMode() ? 'Generic_Save' : 'Generic_Add';
    }

    public setFocus(): void {
        this.craftInput.setFocus();
    }

    private _isEditMode(): boolean {
        return this.mode === CaptureModeEnum.update;
    }

    private _setFormValue(value: ProjectCraftsCapture): void {
        this.form.setValue(value);
    }

    private _setupIsUpdateMode(): void {
        this.isUpdateMode = this._isEditMode();
    }

    private _setRandomColor(): string {
        return this.craftColors[Math.floor(Math.random() * this.craftColors.length)];
    }

    private _getColor(): string {
        return this._defaultValues.color || this._setRandomColor();
    }

    private _validatorFn(control: AbstractControl): { [key: string]: { valid: boolean; message: string } } | null {
        return GenericValidators.isInRange(this.minStep, this._defaultValues?.position)(control);
    }
}

type ProjectCraftsCaptureElement = 'button' | 'input' | 'capture';
type ProjectCraftsCaptureMode = 'regular' | 'edit';
