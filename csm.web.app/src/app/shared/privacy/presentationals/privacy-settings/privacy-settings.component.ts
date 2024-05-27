/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {UserPrivacySettings} from '../../api/resources/user-privacy-settings.resource';

@Component({
    selector: 'ss-privacy-settings',
    templateUrl: './privacy-settings.component.html',
    styleUrls: ['./privacy-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacySettingsComponent {

    @Input()
    public set privacySettings(privacySettings: UserPrivacySettings) {
        this._setForm(privacySettings);
    }

    @Output()
    public savePrivacySettings: EventEmitter<UserPrivacySettings> = new EventEmitter<UserPrivacySettings>();

    public form: UntypedFormGroup;

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public handleAcceptAll(): void {
        this.form.patchValue({
            performance: true,
            comfort: true,
        });

        this.handleSave();
    }

    public handleSave(): void {
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            ...this.form.value,
        };

        this.savePrivacySettings.emit(privacySettings);
    }

    private _setForm(privacySettings: UserPrivacySettings): void {
        const {performance, comfort} = privacySettings || new UserPrivacySettings();

        this.form = this._formBuilder.group({
            comfort: [comfort],
            performance: [performance],
        });
    }
}
