/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ModalIdEnum} from '../../../misc/enums/modal-id.enum';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {UserPrivacySettings} from '../../api/resources/user-privacy-settings.resource';

@Component({
    selector: 'ss-privacy-settings-modal',
    templateUrl: './privacy-settings-modal.component.html',
})
export class PrivacySettingsModalComponent implements OnInit, OnDestroy {

    public privacySettingsModalId = ModalIdEnum.PrivacySettings;

    public privacySettings: UserPrivacySettings;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _modalService: ModalService,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._requestPrivacySettings();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSave(value: UserPrivacySettings): void {
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            ...value,
        };

        this._store.dispatch(new UserActions.Set.PrivacySettings(privacySettings));

        this._modalService.close();
    }

    private _requestPrivacySettings() {
        this._store.dispatch(new UserActions.Request.PrivacySettings());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._userQueries.observeUserPrivacySettings()
                .subscribe(privacySettings => {
                    this.privacySettings = privacySettings;

                    if (!privacySettings) {
                        this._modalService.open({
                            id: ModalIdEnum.PrivacySettings,
                            data: null,
                        });
                    }
                })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
