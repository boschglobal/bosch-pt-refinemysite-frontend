/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Moment} from 'moment';

import {Address} from '../../../../shared/misc/api/datatypes/address.datatype';

export class ProjectCaptureModel {
    public id?: string;
    public title: string;
    public start: Moment;
    public end: Moment;
    public address: Address;
    public client: string;
    public description: string;
    public projectNumber: string;
    public category: string;
    public picture?: File;
}
