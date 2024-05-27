/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractResource} from '../../../../../shared/misc/api/resources/abstract.resource';

export class ProjectImportAnalyzeResource extends AbstractResource {
    public validationResults: ProjectImportValidationResult[];
    public statistics: ProjectImportStatistics;
    public _links?: ProjectImportAnalyzeResourceLinks;
}

export class ProjectImportStatistics {
    public workAreas: number;
    public crafts: number;
    public tasks: number;
    public milestones: number;
    public relations: number;
}

export class ProjectImportValidationResult {
    public type: ValidationType;
    public summary: string;
    public elements: string[];
}

export class ProjectImportAnalyzeResourceLinks {
    public import?: ResourceLink;
}

export enum ValidationType {
    INFO = 'INFO',
    ERROR = 'ERROR',
}
