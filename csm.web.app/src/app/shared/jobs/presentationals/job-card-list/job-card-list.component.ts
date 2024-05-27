/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {
    JobCard,
    JobCardTypesEnum
} from '../../../../project/project-common/models/job-card/job-card';
import {JobResource} from '../../api/resources/job.resource';

@Component({
    selector: 'ss-job-card-list',
    templateUrl: './job-card-list.component.html',
    styleUrls: ['./job-card-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardListComponent {

    @Input()
    public isLoading: boolean;

    @Input()
    public set jobs(jobs: JobResource[]) {
        this.cards = jobs.map(job => JobCard.fromJobResource(job));
    }

    @Input()
    public jobServiceUnavailable: boolean;

    @Output()
    public jobCardClicked = new EventEmitter<string>();

    public cards: JobCard[] = [];

    public calendarExportTypeCardEnum = JobCardTypesEnum.CalendarExport;

    public projectImportTypeCardEnum = JobCardTypesEnum.ProjectImport;

    public projectExportTypeCardEnum = JobCardTypesEnum.ProjectExport;

    public projectCopyTypeCardEnum = JobCardTypesEnum.ProjectCopy;

    public projectRescheduleTypeCardEnum = JobCardTypesEnum.ProjectReschedule;

    public handleCardClick($event: any): void {
        this.jobCardClicked.emit($event);
    }

    public trackByFn(index: number, item: JobCard): string {
        return item.id;
    }
}
