/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit
} from '@angular/core';
import {isEqual} from 'lodash';
import {
    distinctUntilChanged,
    filter,
} from 'rxjs/operators';

import {ModalIdEnum} from './shared/misc/enums/modal-id.enum';
import {MonitoringHelper} from './shared/monitoring/helpers/monitoring.helper';
import {TranslateHelper} from './shared/translation/helper/translate.helper';
import {UserResource} from './user/api/resources/user.resource';
import {UserQueries} from './user/store/user/user.queries';

@Component({
    selector: 'ss-app',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    public confirmationDialogId = ModalIdEnum.ConfirmationDialog;

    constructor(private _monitoringHelper: MonitoringHelper,
                private _translateHelper: TranslateHelper,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._configLogCollection();
        this._configRealUserMonitoring();
        this._subscribeToUserLanguage();
    }

    private _configUserLanguage({locale, country}: UserResource): void {
        const cultureLanguage = `${locale}-${country}`;

        this._translateHelper.configLanguage(locale, cultureLanguage);
    }

    private _configLogCollection(): void {
        this._monitoringHelper.configLogCollection();
    }

    private _configRealUserMonitoring() {
        this._monitoringHelper.configRealUserMonitoring();
    }

    private _subscribeToUserLanguage(): void {
        this._userQueries.observeCurrentUser()
            .pipe(
                filter(user => !!user?.locale && !!user?.country),
                distinctUntilChanged(isEqual),
            )
            .subscribe(user => this._configUserLanguage(user));
    }
}
