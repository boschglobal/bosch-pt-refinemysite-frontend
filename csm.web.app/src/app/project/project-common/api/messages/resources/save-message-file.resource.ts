/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class SaveMessageFileResource {
    public messageId: string;
    public files: File[];
    public topicId: string;

    constructor(id: string, files: File[], topicId: string) {
        this.messageId = id;
        this.files = files;
        this.topicId = topicId;
    }
}
