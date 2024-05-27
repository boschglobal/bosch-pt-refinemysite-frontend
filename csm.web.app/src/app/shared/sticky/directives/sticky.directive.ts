/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    AfterViewChecked,
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    ViewContainerRef
} from '@angular/core';
import {
    Subject,
    Subscription
} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {StickyElement} from '../api/resources/sticky-element.datatype';
import {StickyService} from '../api/sticky.service';
import {StickyMirrorComponent} from '../presentationals/sticky-mirror/sticky-mirror.component';

@Directive({
    selector: '[ssSticky]',
})
export class StickyDirective implements OnInit, OnDestroy, AfterViewChecked {

    /**
     * @description Input for distance from top where the element should start to be sticky
     * @type {number}
     */
    @Input()
    public stickyTop: number;

    /**
     * @description Input for distance from bottom where the element should start to be sticky
     * @type {number}
     */
    @Input()
    public stickyBottom: number;

    /**
     * @description Input for screen width the element should be sticky until
     * @type {number}
     */
    @Input()
    public stickyUntil: number;

    /**
     * @description Input for unique ide of the sticky element
     * @type {string}
     */
    @Input()
    public stickyId: string;

    /**
     * @description Input for z-index the element should assume when sticky
     * @type {number}
     */
    @Input()
    public stickyIndex: number;

    /**
     * @description Input for whether a border should be shown when sticky
     * @type {boolean}
     */
    @Input()
    public stickyBorderBottom: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _height: number;

    private _sticky: StickyElement;

    private _updateSticky$: Subject<void> = new Subject<void>();

    constructor(private el: ElementRef,
                private _stickyService: StickyService,
                private _viewContainerRef: ViewContainerRef,
                private _ngZone: NgZone) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._setStickyElement();
    }

    ngAfterViewChecked() {
        this._ngZone.runOutsideAngular(() => {
            this._updateSticky$.next();
        });
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._unsetStickyElement();
    }

    private _setStickyElement(): void {
        const componentRef = this._viewContainerRef.createComponent(StickyMirrorComponent);
        this._sticky = new StickyElement(
            this.stickyId,
            this.el.nativeElement,
            componentRef.location.nativeElement,
            this.stickyTop,
            this.stickyBottom,
            this.stickyIndex,
            this.stickyUntil,
            this.stickyBorderBottom
        );
        this._stickyService.register(this._sticky);
        this._height = this.el.nativeElement.parentElement.getBoundingClientRect().height;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._updateSticky$
                .pipe(debounceTime(100))
                .subscribe(() => {
                    this._updateSticky();
                })
        );
    }

    private _unsetStickyElement(): void {
        this._stickyService.unregister(this.stickyId);
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _updateSticky(): void {
        const height = this.el.nativeElement.getBoundingClientRect().height;

        if (this._height !== height) {
            this._height = height;
            this._sticky.updateSticky();
        }
    }
}
