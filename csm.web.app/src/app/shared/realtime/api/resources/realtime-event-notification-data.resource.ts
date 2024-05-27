/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class RealtimeEventNotificationDataResource {

    constructor(public lastAdded: string) {
    }

    public static fromString(data: string): RealtimeEventNotificationDataResource {
        const {lastAdded} = JSON.parse(data);
        return new RealtimeEventNotificationDataResource(lastAdded);
    }
}
