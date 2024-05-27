/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ReplaySubject} from 'rxjs';

export class EventSourceServiceStub {
    public currentConnection: EventSourceStub;

    private _events: ReplaySubject<any> = new ReplaySubject<any>(1);

    public connect(url: string, eventSourceInitDict?: EventSourceInit) {
        this.currentConnection = new EventSourceStub(url, eventSourceInitDict);
        this.currentConnection.events = this._events;
        return this.currentConnection;
    }

    public dispatchMessage(event: any): void {
        this._events = new ReplaySubject<any>(1);
        this._events.next(event);
    }

    public dispatchOpen(event: any): void {
        this.currentConnection.onopen(event);
    }

    public dispatchError(event: any): void {
        this.currentConnection.onerror(event);
    }
}

export class EventSourceStub {
    public onmessage: (event: MessageEvent) => void = () => {};
    public close: () => void = () => {};
    public onopen: (event: Event) => {};
    public onerror: (event: Event) => {};
    public events: ReplaySubject<any>;

    constructor(public url: string, public options: object) {
    }

    public emitData(callback: any, data: object) {
        callback(data);
    }

    public addEventListener(eventType: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        this.events
            .subscribe(value => {
                this.emitData(callback, value);
            });
    }

    dispatchEvent(event: Event): boolean {
        return true;
    }

    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
    }
}
