/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {TopicCriticalityEnum} from '../../../enums/topic-criticality.enum';

export class SaveTopicResource {
    public description: string;
    public files?: File[];
    public criticality?: TopicCriticalityEnum;

    constructor(description: string, files: File[], criticality?: TopicCriticalityEnum) {
        this.description = description;
        this.files = files;
        this.criticality = criticality;
    }
}
