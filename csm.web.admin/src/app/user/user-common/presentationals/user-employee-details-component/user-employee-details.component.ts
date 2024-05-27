/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {EmployeeResource} from '../../../../employee/employee-common/api/resources/employee.resource';
import {
    EmployeeRoleEnum,
    employeeRolesEnumHelper
} from '../../../../employee/employee-common/api/resources/employee-roles.enum';


@Component({
    selector: 'ss-user-employee-details',
    templateUrl: './user-employee-details.component.html',
    styleUrls: ['./user-employee-details.component.scss']
})
export class UserEmployeeDetailsComponent {

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    employee: EmployeeResource;

    /**
     * @description Emits when editing the employee
     * @type {EventEmitter<EmployeeResource>}
     */
    @Output()
    public edit: EventEmitter<EmployeeResource> = new EventEmitter<EmployeeResource>();

    /**
     * @description Emits when deleting the employee
     * @type {EventEmitter<EmployeeResource>}
     */
    @Output()
    public delete: EventEmitter<EmployeeResource> = new EventEmitter<EmployeeResource>();

    constructor(private _translateService: TranslateService) {
    }

    public handleEdit() {
        this.edit.emit(this.employee);
    }

    public handleDelete() {
        if (this.canDelete(this.employee)) {
            this.delete.emit(this.employee);
        }
    }

    public canDelete(employee: EmployeeResource) {
        return employee._links.hasOwnProperty('delete');
    }
}
