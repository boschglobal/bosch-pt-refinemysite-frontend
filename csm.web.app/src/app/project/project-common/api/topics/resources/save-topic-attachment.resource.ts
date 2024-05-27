/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class SaveTopicAttachmentResource {
    public id: string;
    public files: File[];

    constructor(id: string, files: File[]) {
        this.id = id;
        this.files = files;
    }
}
