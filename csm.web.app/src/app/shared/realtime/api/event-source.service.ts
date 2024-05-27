/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventSourceService {
    connect(url: string, eventSourceInitDict?: EventSourceInit): EventSource {
        return new EventSource(url, eventSourceInitDict);
    }
}
