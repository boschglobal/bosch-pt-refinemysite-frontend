/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActivityResource} from '../../../../../project-common/api/activities/resources/activity.resource';

export class ProjectTaskActivitiesListModel {
    public activity: ActivityResource;
    public isNew: boolean;

    constructor(activity: ActivityResource, isNew = false) {
        this.activity = activity;
        this.isNew = isNew;
    }
}
