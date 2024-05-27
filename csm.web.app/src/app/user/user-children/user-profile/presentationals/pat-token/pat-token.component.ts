/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup
} from '@angular/forms';

import {COLORS} from '../../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-pat-token',
    templateUrl: './pat-token.component.html',
    styleUrls: ['./pat-token.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatTokenComponent {

    @Input()
    public set defaultValue(value: string) {
        this._setFormValue(value || '');
    }

    @Output()
    public copiedToClipboard: EventEmitter<void> = new EventEmitter<void>();

    public readonly form: FormGroup = this._formBuilder.group({
        token: new FormControl(''),
    });

    public iconColor: string = COLORS.white;

    constructor(private _formBuilder: FormBuilder) {
    }

    public handleCopy(): void {
        navigator.clipboard.writeText(this.form.get('token').value).then(
            () => this.copiedToClipboard.emit()
        );
    }

    private _setFormValue(value: string): void {
        this.form.get('token').setValue(value);
    }
}
