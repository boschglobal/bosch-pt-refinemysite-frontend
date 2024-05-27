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
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {
    ActivityDescriptionValues,
    ResourceReferenceActivity
} from '../../../../../project-common/api/activities/resources/activity.resource';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../../project-routing/project-route.paths';
import {ProjectTaskActivitiesListModel} from '../../containers/task-activities-list/project-task-activities-list.model';
import {ProjectTaskActivityCardModel} from './project-task-activity-card.model';

export const RESOURCE_ANCHOR = 'ProjectParticipant';

export const CSS_PROJECT_TASK_ACTIVITY_CARD_HAS_MARKER = 'ss-project-task-activity-card--has-marker';

@Component({
    selector: 'ss-project-task-activity-card',
    templateUrl: './project-task-activity-card.component.html',
    styleUrls: ['./project-task-activity-card.component.scss']
})
export class ProjectTaskActivityCardComponent {
    /**
     * @description Input with activity data
     */
    @Input()
    public set activity(activityModel: ProjectTaskActivitiesListModel) {
        const {activity, isNew} = activityModel;
        const {description, changes, date, user, _embedded} = activity;

        const title: string[] | ResourceReferenceActivity[] = this._getParsedTitle(description.template, description.values);
        const content: string[] = changes ? changes : null;
        const activityDate: string = moment(date).locale(this._getCurrentLang()).calendar();
        const userPicture: string = user.picture;
        const attachment: any = _embedded && _embedded.attachments ? {
            link: _embedded.attachments._links.preview.href,
            fileName: _embedded.attachments.fileName
        } : null;
        const thumbnail: AttachmentResource = _embedded && _embedded.attachments ? _embedded.attachments : null;

        this.projectTaskActivityCardModel = {
            title,
            content,
            activityDate,
            userPicture,
            attachment,
            thumbnail,
            isNew
        };
    }

    /**
     * @description Triggered when thumbnail is clicked
     * @type {EventEmitter<any>}
     */
    @Output()
    public onClickThumbnail: EventEmitter<AttachmentResource> = new EventEmitter<AttachmentResource>();

    /**
     * @description Model of project activity card
     */
    public projectTaskActivityCardModel: ProjectTaskActivityCardModel;

    /**
     * @description Number of attachments per row
     * @type {number}
     */
    public itemsPerRow = 6;

    constructor(private _activatedRoute: ActivatedRoute,
                private _translateService: TranslateService) {
    }

    /**
     * @description Retrieve if exist attachment
     * @returns {boolean}
     */
    public get hasAttachment(): boolean {
        return !!(this.projectTaskActivityCardModel.attachment);
    }

    /**
     * @description Retrieve whether exist more than one change and no attachment
     * @returns {boolean}
     */
    public get hasContent(): boolean {
        return this.projectTaskActivityCardModel.content && !this.projectTaskActivityCardModel.attachment;
    }

    /**
     * @description Retrieves true if value is object
     * @param {Object | string} value
     * @returns {boolean}
     */
    public isObject(value: Object | string): boolean {
        return value instanceof Object;
    }

    /**
     * @description Retrieves if type should an URL
     * @param {string} type
     * @returns {boolean}
     */
    public isAnchor(type: string): boolean {
        return type === RESOURCE_ANCHOR;
    }

    /**
     * @description Triggered when thumbnail is clicked
     * @param {AttachmentResource} thumbnail
     */
    public onClickThumbnailEvent(thumbnail: AttachmentResource): void {
        this.onClickThumbnail.emit(thumbnail);
    }

    /**
     * @description Retrieve router link for participant passed in
     * @param {string} participantId
     * @returns {string}
     */
    public getRouterLink(participantId: string): string {
        return `/projects/${this._getProjectId}/participants/${participantId}`;
    }

    public getActivityClasses(): Object {
        return {
            [CSS_PROJECT_TASK_ACTIVITY_CARD_HAS_MARKER]: this.projectTaskActivityCardModel.isNew
        };
    }

    private _getParsedTitle(template: string, values: ActivityDescriptionValues): string[] | ResourceReferenceActivity[] {
        const regex = new RegExp(/\${(.*?)}/g);
        const matches: RegExpMatchArray = template.match(regex);
        const title: any = [template];

        if (matches) {
            matches
                .forEach((key: string) => {
                    const parsedKey: string = key.replace(/[${}]/g, '');
                    const index: number = title[title.length - 1].indexOf(key);
                    const temporaryTitle = [];
                    const lastEntry: string = title.pop();

                    temporaryTitle.push(lastEntry.substr(0, index));
                    temporaryTitle.push(lastEntry.substr(index, key.length));
                    temporaryTitle.push(lastEntry.substr(index + key.length));

                    temporaryTitle.forEach((item, position) => {
                        if (item.length) {
                            if (position === 1) {
                                title.push(values[parsedKey]);
                            } else {
                                title.push(item);
                            }
                        }
                    });
                });
        }

        return title;
    }

    private get _getProjectId(): string {
        return this._activatedRoute.root.firstChild.snapshot.children[0].params[ROUTE_PARAM_PROJECT_ID];
    }

    private _getCurrentLang(): string {
        return this._translateService.defaultLang;
    }
}
