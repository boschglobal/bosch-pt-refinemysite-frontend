/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import {EnvironmentHelper} from '../../../shared/misc/helpers/environment.helper';
import {ProjectUrlRetriever} from '../../project-routing/helper/project-url-retriever';

@Component({
    selector: 'ss-project-toolbar',
    templateUrl: './project-toolbar.component.html',
    styleUrls: ['./project-toolbar.component.scss'],
})
export class ProjectToolbarComponent implements OnInit {

    @Input()
    public showCreateButton: boolean;

    /**
     * @description Property with the URL for the create project page
     */
    public createProjectPageUrl = [ProjectUrlRetriever.getProjectCreateUrl()];

    /**
     * @description Property with the URL for the Excel template download
     */
    public downloadProjectsExcelTemplateUrl: string;

    constructor(private _environmentHelper: EnvironmentHelper) {
    }

    ngOnInit() {
        this.downloadProjectsExcelTemplateUrl = this._environmentHelper.getConfiguration().projectExportExcelTemplateUrl;
    }

}
