/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    LangChangeEvent,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    merge,
    Subscription
} from 'rxjs';
import {
    filter,
    map
} from 'rxjs/operators';

import {UUID} from '../../misc/identification/uuid';
import {DateParserStrategy} from '../dates/date-parser.strategy';
import {FlyoutService} from '../flyout/service/flyout.service';

export const CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN = 'ss-scope-dropdown--open';

@Component({
    selector: 'ss-scope-dropdown',
    templateUrl: './scope-dropdown.component.html',
    styleUrls: ['./scope-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ScopeDropdownComponent implements OnInit, OnDestroy {
    @Input()
    public set scopeStart(scopeStart: moment.Moment) {
        this._scopeStart = scopeStart.clone();
        this._setDisplayValue();
    }

    @Input()
    public set scopeDuration(duration: number) {
        this._scopeDuration = duration;
        this._setDisplayValue();
    }

    @Output()
    public scopeStartChange: EventEmitter<moment.Moment> = new EventEmitter();

    public get scopeStart(): moment.Moment {
        return this._scopeStart;
    }

    public buttonClasses: { [key: string]: boolean };

    public displayValue = '';

    public flyoutId = `ss-scope-dropdown-${UUID.v4()}`;

    public iconRotation = -90;

    private _currentLanguage: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _isOpen = false;

    private _scopeDuration: number;

    private _scopeStart: moment.Moment;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _dateParser: DateParserStrategy,
                private _flyoutService: FlyoutService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setCurrentLanguage();
        this._setDisplayValue();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleScopeStartChange(start: moment.Moment): void {
        this._scopeStart = this._dateParser.startOfWeek(start);
        this._setDisplayValue();
        this.scopeStartChange.emit(this._scopeStart);
        this._flyoutService.close(this.flyoutId);
    }

    private _handleFlyoutToggle(isOpen: boolean): void {
        this._isOpen = isOpen;
        this._setIconRotation();
        this._setButtonClasses();
        this._changeDetectorRef.detectChanges();
    }

    private _handleLanguageChange(event: LangChangeEvent): void {
        this._currentLanguage = event.lang;
        this._setDisplayValue();
        this._changeDetectorRef.detectChanges();
    }

    private _setButtonClasses(): void {
        this.buttonClasses = {
            [CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN]: this._isOpen,
        };
    }

    private _setCurrentLanguage(): void {
        this._currentLanguage = this._translateService.defaultLang;
    }

    private _setDisplayValue(): void {
        if (!this._scopeDuration || !this._scopeStart || !this._currentLanguage) {
            return;
        }

        const start = this._scopeStart.locale(this._currentLanguage);
        const end = this._dateParser.endOfWeek(this._scopeStart.clone().add(this._scopeDuration - 1, 'd'));
        const isSameYear = start.year() === end.year();
        const startFormat = isSameYear ? 'MMM' : 'MMM YYYY';
        const endFormat = 'MMM YYYY';

        this.displayValue = `${start.format(startFormat)} – ${end.format(endFormat)}`;
    }

    private _setIconRotation(): void {
        this.iconRotation = this._isOpen ? 90 : -90;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            merge(
                this._flyoutService.openEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => true),
                ),
                this._flyoutService.closeEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => false),
                )
            ).subscribe(isOpen => this._handleFlyoutToggle(isOpen))
        );

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe((event: LangChangeEvent) => this._handleLanguageChange(event)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
