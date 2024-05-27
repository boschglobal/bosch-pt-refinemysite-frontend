/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';

@Component({
    selector: 'ss-milestone-title-capture',
    templateUrl: './milestone-title-capture.component.html',
    styleUrls: ['./milestone-title-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneTitleCaptureComponent implements AfterViewInit, OnInit {

    @ViewChild('input', {static: true})
    public input: ElementRef;

    @Output()
    public submitTitle: EventEmitter<string> = new EventEmitter<string>();

    public form: UntypedFormGroup;

    public maxLength = 100;

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    ngAfterViewInit() {
        this.input.nativeElement.focus();
    }

    public handleSubmit(): void {
        const {valid, value: {title}} = this.form;

        if (valid) {
            this.submitTitle.emit(title);
        }
    }

    private _setupForm() {
        this.form = this._formBuilder.group({
            title: ['', [GenericValidators.isRequired()]],
        });
    }
}
