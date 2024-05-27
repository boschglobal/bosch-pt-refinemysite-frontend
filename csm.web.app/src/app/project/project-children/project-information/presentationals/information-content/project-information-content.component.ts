/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnInit,
} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectResource} from '../../../../project-common/api/projects/resources/project.resource';
import {ProjectCategoryEnumHelper} from '../../../../project-common/enums/project-category.enum';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';

interface ProjectCardRow {
    label: string;
    description: string | null;
    translate?: boolean;
}

@Component({
    selector: 'ss-project-information-content',
    templateUrl: './project-information-content.component.html',
    styleUrls: ['./project-information-content.component.scss'],
})
export class ProjectInformationContentComponent implements OnInit {

    /**
     * @description Property with project information
     */
    @Input()
    public project: ProjectResource;

    /**
     * @description describes if user has edit permission for project
     */
    @Input()
    public hasEditPermission: boolean;

    /**
     * @description list of project contacts
     */
    @Input()
    public contacts: ProjectParticipantResource[] = [];

    public projectDetailsInformation: ProjectCardRow[];

    constructor(private _router: Router,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setProjectDetailsInformation();
    }

    /**
     * @description Retrieves project picture
     * @returns {string}
     */
    public get getProjectPicture(): string {
        return this.project && this.project._embedded.projectPicture ? this.project._embedded.projectPicture._links.small.href : null;
    }

    /**
     * @description Navigate to user profile when clicking the user card
     */
    public navigateToUserProfile(contact: ProjectParticipantResource): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectParticipantsProfileUrl(this.project.id, contact.id));
    }

    private _setProjectDetailsInformation(): void {
        const {start, end, client, category} = this.project;

        this.projectDetailsInformation = [
            {
                label: 'Project_Start_Label',
                description: this._getFormattedDate(start)
            },
            {
                label: 'Project_End_Label',
                description: this._getFormattedDate(end)
            },
            {
                label: 'Generic_Client',
                description: client
            },
            {
                label: 'Generic_Category',
                description: this._getCategoryMessageKey(category),
                translate: true
            },
            ...this._getProjectAddressInformation()
        ];
    }

    private _getProjectAddressInformation(): ProjectCardRow[] {
        const {street, houseNumber, city, zipCode} = this.project.address;
        return [
            {
                label: 'Generic_Street',
                description: street
            },
            {
                label: 'Generic_HouseNumber',
                description: houseNumber
            },
            {
                label: 'Generic_ZipCode',
                description: zipCode
            },
            {
                label: 'Generic_City',
                description: city
            },
        ];
    }

    private _getCategoryMessageKey(category: string): string {
        return typeof category !== 'undefined' ? ProjectCategoryEnumHelper.getLabelByKey(category) : null;
    }

    private _getFormattedDate(date: Date): string {
        return moment(date).locale(this._getCurrentLang()).format('LL');
    }

    private _getCurrentLang(): string {
        return this._translateService.defaultLang;
    }
}
