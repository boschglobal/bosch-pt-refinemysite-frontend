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
    Input,
    OnInit,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {UUID} from '../../../../../shared/misc/identification/uuid';
import {
    CollapsibleListItem,
    CollapsibleListItemState,
} from '../../../../../shared/ui/collapsible-list/collapsible-list.component';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {
    ProjectImportAnalyzeResource,
    ProjectImportStatistics,
    ProjectImportValidationResult,
    ValidationType,
} from '../../../../project-common/api/project-import/resources/project-import-analyze.resource';

@Component({
    selector: 'ss-project-import-review-data',
    templateUrl: './project-import-review-data.component.html',
    styleUrls: ['./project-import-review-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportReviewDataComponent implements OnInit{

    @Input()
    public resource: ProjectImportAnalyzeResource;

    public records: ProjectStatistics[];

    public statisticsIconColor = COLORS.light_green;
    public validationWarningColor = COLORS.orange;
    public validationErrorColor = COLORS.red;

    constructor(private _translateService: TranslateService) {
    }

    public ngOnInit(): void {
        this._createListEntries();
    }

    private _createListEntries(): void {
        const statistics = Object.entries(this.resource.statistics)
            .map(([key, val]) => ({
                id: UUID.v4(),
                isNew: true,
                state: 'success' as CollapsibleListItemState,
                summary: this._translateService.instant(statisticTranslations[key], {dataAmount: val}),
                notCollapsible: true,
            }));

        const validationResults = this.resource.validationResults
            .map((entry: ProjectImportValidationResult) => ({
                id: UUID.v4(),
                isNew: true,
                state: typeStateMap[entry.type],
                summary: entry.summary,
                elements: entry.elements,
                notCollapsible: !entry.elements.length,
            }));

        this.records = statistics.concat(validationResults);
    }
}
export interface ProjectStatistics extends CollapsibleListItem {
    summary: string;
    elements?: string[];
}

const typeStateMap = {
    [ValidationType.ERROR]: 'error' as CollapsibleListItemState,
    [ValidationType.INFO]: 'warning' as CollapsibleListItemState,
};

const statisticTranslations: { [key in keyof ProjectImportStatistics]: string } = {
    crafts: 'Project_Import_ReviewDataCraftsSummary',
    workAreas: 'Project_Import_ReviewDataWorkAreasSummary',
    tasks: 'Project_Import_ReviewDataTasksSummary',
    milestones: 'Project_Import_ReviewDataMilestonesSummary',
    relations: 'Project_Import_ReviewDataRelationsSummary',
};
