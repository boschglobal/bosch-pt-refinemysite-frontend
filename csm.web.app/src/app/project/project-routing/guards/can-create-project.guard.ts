/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';

import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';

@Injectable({
    providedIn: 'root',
})
export class CanCreateProjectGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _projectSliceService: ProjectSliceService,
                private _router: Router) {
        super(_router);
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this._projectSliceService.hasCreateProjectPermission()) {
            return true;
        } else {
            this._handleUnauthorized();
            return false;
        }
    }
}
