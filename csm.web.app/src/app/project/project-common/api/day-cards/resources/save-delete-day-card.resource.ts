/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractIdsSaveResource} from '../../../../../shared/misc/api/resources/abstract-ids-save.resource';

export class SaveDeleteDayCardResource extends AbstractIdsSaveResource {
    public scheduleVersion: number;

    constructor(scheduleVersion: number,
                ids: string[]) {
        super(ids);
        this.scheduleVersion = scheduleVersion;
    }
}
