/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AlertTypeEnum} from '../../enums/alert-type.enum';

export class AnnouncementResource {

     constructor(public id: string,
                 public type: AlertTypeEnum,
                 public message: string) {
    }
 }
