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

import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';

export class ProjectKpisListItem extends NameValuePair {
    color?: string;
}

@Component({
    selector: 'ss-project-kpis-list',
    templateUrl: './project-kpis-list.component.html',
    styleUrls: ['./project-kpis-list.component.scss']
})

export class ProjectKpisListComponent {

    @Input()
    public data: ProjectKpisListItem[];

    @Input()
    public showTotal = false;

    public total(): number {
        return this.data.reduce((acc, cur) => acc + cur.value, 0);
    }

    public canShowTotal(): boolean {
        return this.showTotal && this.data.length > 1;
    }

    public hasColors(): boolean {
        return this.data.find(item => item.color != null) != null;
    }
}
