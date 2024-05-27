/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Observable,
    of
} from 'rxjs';

import {CalendarUserSettings} from '../../../project/project-common/api/calendar/resources/calendar-user-settings';
import {LocalStorageKeysEnum} from '../../misc/enums/local-storage-keys.enum';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private readonly _storage: Storage;

    public constructor() {
        this._storage = localStorage;
    }

    public findCalendarUserSettings(): Observable<CalendarUserSettings> {
        const parsedObject = this._getItem(LocalStorageKeysEnum.CalendarUserSettings);
        return of(Object.assign(new CalendarUserSettings(), parsedObject));
    }

    public updateCalendarUserSettings(value: CalendarUserSettings): Observable<CalendarUserSettings> {
        this._setItem(LocalStorageKeysEnum.CalendarUserSettings, value);
        return this.findCalendarUserSettings();
    }

    public findWhatsNewReadArticles(): string[] {
        return this._getItem(LocalStorageKeysEnum.WhatsNewReadArticles);
    }

    public updateWhatsNewReadArticles(value: string[]): void {
        this._setItem(LocalStorageKeysEnum.WhatsNewReadArticles, value);
    }

    private _getItem(key: LocalStorageKeysEnum): any {
        return JSON.parse(this._storage.getItem(key));
    }

    private _setItem(key: LocalStorageKeysEnum, value: Object): void {
        this._storage.setItem(key, JSON.stringify(value));
    }
}
