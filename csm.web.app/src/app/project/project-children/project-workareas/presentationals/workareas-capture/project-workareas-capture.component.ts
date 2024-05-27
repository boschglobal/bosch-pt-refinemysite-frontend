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
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../shared/misc/validation/generic.warnings';
import {InputTextComponent} from '../../../../../shared/ui/forms/input-text/input-text.component';

export interface ProjectWorkareasCapture {
    name: string;
    position: number;
}

@Component({
    selector: 'ss-project-workareas-capture',
    templateUrl: './project-workareas-capture.component.html',
    styleUrls: ['./project-workareas-capture.component.scss']
})
export class ProjectWorkareasCaptureComponent implements OnInit {

    @ViewChild('workareaInput', {static: true})
    public workareaInput: InputTextComponent;

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public onSubmit: EventEmitter<ProjectWorkareasCapture> = new EventEmitter<ProjectWorkareasCapture>();

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public mode: CaptureModeEnum;

    @Input()
    public set defaultValues(defaultValues: ProjectWorkareasCapture) {
        if (this._defaultValues.position !== defaultValues.position) {
            this._defaultValues = defaultValues;
            this._setupForm();
        }

        this._defaultValues = defaultValues;
    }

    public form: UntypedFormGroup;

    public minStep = 1;

    public validations: any = {
        name: {
            maxLength: 100
        }
    };

    private _defaultValues: ProjectWorkareasCapture = {
        name: '',
        position: 0
    };

    private _elementStyles: { [element in ProjectWorkareasCaptureElement]: { [mode in ProjectWorkareasCaptureMode]: string } } = {
        input: {
            regular: 'ss-project-workareas-capture__inputs col-md-12 col-lg-6',
            edit: 'ss-project-workareas-capture__inputs--edit col-md-12 col-lg-6'
        },
        button: {
            regular: 'ss-project-workareas-capture__buttons ss-button-group col-sm-12',
            edit: 'ss-project-workareas-capture__buttons--edit ss-button-group col-md-12 col-lg-6'
        },
        capture: {
            regular: 'ss-project-workareas-capture',
            edit: 'ss-project-workareas-capture--edit'
        },
        grid: {
            regular: 'row',
            edit: 'ss-project-workareas-capture--edit row'
        }
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    public getElementStyles(element: ProjectWorkareasCaptureElement) {
        return this.isEditMode() ? this._elementStyles[element].edit : this._elementStyles[element].regular;
    }

    public getPositionInEdit() {
        return this._defaultValues.position + '.';
    }

    public handleSubmit(): void {
        const value: ProjectWorkareasCapture = this.form.value;
        this.onSubmit.emit(value);
    }

    public handleCancel(): void {
        this.onCancel.emit();
    }

    public resetForm(): void {
        if (this.form) {
            this.form.reset();
            this.form.updateValueAndValidity();
        }

        this._setupForm();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public setFocus(): void {
        this.workareaInput.setFocus();
    }

    public get submitKey(): string {
        return this.isEditMode() ? 'Generic_Save' : 'Generic_Add';
    }

    public get maxPosition(): number {
        return this._defaultValues.position;
    }

    public isEditMode(): boolean {
        return this.mode === CaptureModeEnum.update;
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            name: [this._defaultValues.name,
                [GenericValidators.isRequired(),
                    GenericValidators.isMaxLength(this.validations.name.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.name.maxLength)]],
            position: [this._defaultValues.position,
                [GenericValidators.isRequired(),
                    GenericValidators.isInRange(1, this._defaultValues.position)]]
        });

        this.form.updateValueAndValidity();
    }
}

type ProjectWorkareasCaptureElement = 'grid' | 'button' | 'input' | 'capture';
type ProjectWorkareasCaptureMode = 'regular' | 'edit';

