/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TimeScopeLabelFormatEnum} from '../../../../project/project-common/enums/date-format.enum';

export enum TimeScopeLabelState {
    empty,
    complete,
    hasStart,
    hasEnd,
}

@Component({
    selector: 'ss-time-scope-label',
    templateUrl: './time-scope-label.component.html',
    styleUrls: ['./time-scope-label.component.scss']
})
export class TimeScopeLabelComponent {

    @Input()
    public set start(start: string) {
        this._start = start;
        this._setTimeScopeLabelState();
    }

    @Input()
    public set end(end: string) {
        this._end = end;
        this._setTimeScopeLabelState();
    }

    @Input()
    public set canAdd(canAdd: boolean) {
        this._canAdd = canAdd;
        this._setTimeScopeLabelState();
    }

    @Input()
    public format: string;

    @Output()
    public addStart: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public addEnd: EventEmitter<null> = new EventEmitter<null>();

    public get start(): string {
        return this._getFormattedDate(this._start);
    }

    public get end(): string {
        return this._getFormattedDate(this._end);
    }

    public get canAdd(): boolean {
        return this._canAdd;
    }

    public timeScopeLabelCurrentState: TimeScopeLabelState;

    public timeScopeLabelState = TimeScopeLabelState;

    private _canAdd: boolean;

    private _start: string;

    private _end: string;

    constructor(private _translateService: TranslateService) {
    }

    public setStart(): void {
        this.addStart.emit();
    }

    public setEnd(): void {
        this.addEnd.emit();
    }

    private _getFormattedDate(date: string): string | null {
        const currentLang: string = this._translateService.defaultLang;
        const dateFormat: string = this.format || TimeScopeLabelFormatEnum[currentLang];

        return date ? moment(date).locale(currentLang).format(dateFormat) : null;
    }

    private _setTimeScopeLabelState(): void {
        if (this.start && this.end) {
            this.timeScopeLabelCurrentState = TimeScopeLabelState.complete;
        } else if (this.start && this.canAdd) {
            this.timeScopeLabelCurrentState = TimeScopeLabelState.hasStart;
        } else if (this.end && this.canAdd) {
            this.timeScopeLabelCurrentState = TimeScopeLabelState.hasEnd;
        } else if (this.canAdd) {
            this.timeScopeLabelCurrentState = TimeScopeLabelState.empty;
        } else {
            this.timeScopeLabelCurrentState = null;
        }
    }

}
