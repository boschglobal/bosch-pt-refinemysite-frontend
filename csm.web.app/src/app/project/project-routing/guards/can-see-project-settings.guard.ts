/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import {Observable} from 'rxjs';
import {
    map,
    take
} from 'rxjs/operators';

import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';

@Injectable({
    providedIn: 'root',
})
export class CanSeeProjectSettingsGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _projectSliceService: ProjectSliceService,
                private _router: Router) {
        super(_router);
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._projectSliceService.observeAccessToProjectSettings()
            .pipe(
                take(1),
                map((hasPermission: boolean) => hasPermission),
                map((canActivate: boolean) => {
                    if (canActivate) {
                        return true;
                    } else {
                        this._handleUnauthorized();
                        return false;
                    }
                }));
    }
}
