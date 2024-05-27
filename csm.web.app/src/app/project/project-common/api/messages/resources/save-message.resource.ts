/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class SaveMessageResource {
    public topicId: string;
    public content?: string;
    public files?: File[];

    constructor(topicId: string, content?: string, files?: File[]) {
        this.topicId = topicId;
        this.content = content;
        this.files = files;
    }
}
