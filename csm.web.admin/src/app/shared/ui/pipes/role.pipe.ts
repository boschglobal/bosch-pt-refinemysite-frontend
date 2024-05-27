/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {
    employeeRolesEnumHelper
} from '../../../employee/employee-common/api/resources/employee-roles.enum';

@Pipe({
    name: 'ssRoles'
})
export class RolesPipe implements PipeTransform {

    constructor(private _translateService: TranslateService) {
    }

    public transform(roles: string[]): string {
        return roles.map(role => this._translateService.instant(employeeRolesEnumHelper.getLabelByValue(role))).join(', ');
    }

}
