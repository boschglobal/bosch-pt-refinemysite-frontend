/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class SaveUserPictureResource {
    public id: string;
    public picture: File;

    constructor(id: string, picture: File) {
        this.id = id;
        this.picture = picture;
    }
}
