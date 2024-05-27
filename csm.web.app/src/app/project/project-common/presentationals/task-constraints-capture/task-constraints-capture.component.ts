/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup
} from '@angular/forms';

import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {ConstraintKey} from '../../api/constraints/resources/constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';

@Component({
    selector: 'ss-task-constraints-capture',
    templateUrl: './task-constraints-capture.component.html',
    styleUrls: ['./task-constraints-capture.component.scss'],
})
export class TaskConstraintsCaptureComponent implements OnInit {

    @Input()
    public mismatchedConstraints = '';

    @Input()
    public set projectActiveConstraints(projectActiveConstraints: ConstraintEntity[]) {
        this._projectActiveConstraints = projectActiveConstraints;
        this._setupForm();
    }

    public get projectActiveConstraints(): ConstraintEntity[] {
        return this._projectActiveConstraints;
    }

    @Input()
    public set taskConstraints(taskConstraints: NamedEnumReference<ConstraintKey>[]) {
        this._taskConstraints = taskConstraints;
        this._setupForm();
    }

    public get taskConstraints(): NamedEnumReference<ConstraintKey>[] {
        return this._taskConstraints;
    }

    @Output()
    public closeCapture: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public submitCapture: EventEmitter<ConstraintKey[]> = new EventEmitter<ConstraintKey[]>();

    public form: UntypedFormGroup;

    private _projectActiveConstraints: ConstraintEntity[] = [];

    private _taskConstraints: NamedEnumReference<ConstraintKey>[] = [];

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    public handleCancel(): void {
        this.resetForm();
        this.closeCapture.emit();
    }

    public onSubmitForm(): void {
        const constraints: ConstraintKey[] = this._getSubmitValue();
        this.submitCapture.emit(constraints);
    }

    public resetForm(): void {
        if (!this.form) {
            return;
        }

        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
    }

    private _getSubmitValue(): ConstraintKey[] {
        const constraints = this.form.get('constraints').value;

        return Object.keys(constraints)
            .filter((key) => constraints[key])
            .map(constraint => constraint as ConstraintKey);
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            constraints: this._formBuilder.group({}),
        });

        this.projectActiveConstraints.forEach((constraint: ConstraintEntity) => this._addConstraint(constraint));
    }

    private _isConstraintSelected(constraintKey: ConstraintKey): boolean {
        return this.taskConstraints
            .some((constraint: NamedEnumReference<ConstraintKey>) => constraint.key === constraintKey);
    }

    private _addConstraint(constraint: ConstraintEntity): void {
        const constraints = this.form.get('constraints') as UntypedFormGroup;
        const constraintControl = new UntypedFormControl(this._isConstraintSelected(constraint.key));

        constraints.addControl(constraint.key, constraintControl);
    }
}
