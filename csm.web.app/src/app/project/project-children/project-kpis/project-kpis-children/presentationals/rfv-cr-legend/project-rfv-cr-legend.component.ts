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

import {ButtonLink} from '../../../../../../shared/ui/links/button-link/button-link.component';
import {RfvKey} from '../../../../../project-common/api/rfvs/resources/rfv.resource';

@Component({
    selector: 'ss-project-rfv-cr-legend',
    templateUrl: './project-rfv-cr-legend.component.html',
    styleUrls: ['./project-rfv-cr-legend.component.scss'],
})
export class ProjectRfvCrLegendComponent {

    @Input()
    public rfvItems: ProjectRfvCrLegendListItem[] = [];

    @Output()
    public rfvItemClick: EventEmitter<ProjectRfvCrLegendListItem> = new EventEmitter<ProjectRfvCrLegendListItem>();

    @Output()
    public rfvItemEnter: EventEmitter<ProjectRfvCrLegendListItem> = new EventEmitter<ProjectRfvCrLegendListItem>();

    @Output()
    public rfvItemLeave: EventEmitter<ProjectRfvCrLegendListItem> = new EventEmitter<ProjectRfvCrLegendListItem>();

    @Output()
    public rfvReset: EventEmitter<void> = new EventEmitter<void>();

    public showAllButton: ButtonLink = {
        label: 'Project_Kpis_RfvClearFiltersLabel',
        action: this.reset.bind(this),
    };

    public isListFiltered(): boolean {
        return this.rfvItems.find(item => item.active) != null;
    }

    public click(rfv: ProjectRfvCrLegendListItem): void {
        this.rfvItemClick.emit(rfv);
    }

    public mouseenter(rfv: ProjectRfvCrLegendListItem): void {
        this.rfvItemEnter.emit(rfv);
    }

    public mouseleave(rfv: ProjectRfvCrLegendListItem): void {
        this.rfvItemLeave.emit(rfv);
    }

    public reset(): void {
        this.rfvReset.emit();
    }

    public trackByFn(index: number, item: ProjectRfvCrLegendListItem): string {
        return item.id;
    }
}

export class ProjectRfvCrLegendListItem {
    id: RfvKey;
    name: string;
    active: boolean;
    color: string;
}
