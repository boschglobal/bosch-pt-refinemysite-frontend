/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {lowerFirst} from 'lodash';
import * as moment from 'moment';

import {AbstractAuditableResource} from '../../api/resources/abstract-auditable.resource';

@Component({
    selector: 'ss-auditable-resource-label',
    templateUrl: './auditable-resource-label.component.html',
    styleUrls: ['./auditable-resource-label.component.scss']
})
export class AuditableResourceLabelComponent<T extends AbstractAuditableResource> {

    @Input()
    public resource: T;

    constructor(private _translateService: TranslateService) {
    }

    public getCalendarTime(date: Date): string {
        return date ? lowerFirst(moment(date).locale(this._getCurrentLang()).calendar()) : null;
    }

    public showModifiedDate(): boolean {
        const validAuditableResource = this.resource && this.resource.createdDate && this.resource.lastModifiedDate;
        return validAuditableResource && !moment(this.resource.createdDate).isSame(this.resource.lastModifiedDate, 'ms');
    }

    private _getCurrentLang(): string {
        return this._translateService.defaultLang;
    }

}
