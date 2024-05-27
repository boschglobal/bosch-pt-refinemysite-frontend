/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Moment} from 'moment';

import {Address} from '../../../../../shared/misc/api/datatypes/address.datatype';

export class SaveProjectResource {
    public id?: string;
    public title: string;
    public start: Moment;
    public end: Moment;
    public address: Address;
    public client: string;
    public description: string;
    public projectNumber: string;
    public category: string;

    constructor(id: string,
                title: string,
                start: Moment,
                end: Moment,
                address: Address,
                client: string,
                description: string,
                projectNumber: string,
                category: string) {
        this.id = id;
        this.title = title;
        this.start = start;
        this.end = end;
        this.address = address;
        this.client = client;
        this.description = description;
        this.projectNumber = projectNumber;
        this.category = category;
    }
}
