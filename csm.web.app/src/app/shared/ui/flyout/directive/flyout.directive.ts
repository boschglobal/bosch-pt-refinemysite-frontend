/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ApplicationRef,
    ComponentRef,
    createComponent,
    Directive,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    HostListener,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    Type,
    ViewRef
} from '@angular/core';
import {isEqual} from 'lodash';
import {
    animationFrameScheduler,
    fromEvent,
    interval,
    merge,
    NEVER,
    Observable,
    scheduled,
    Subscription
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map
} from 'rxjs/operators';

import {KeyEnum} from '../../../misc/enums/key.enum';
import {
    BackdropClickEventTypeEnum,
    BackdropClickHelper,
} from '../../../misc/helpers/backdrop-click.helper';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {
    ElementAlignment,
    ElementPosition,
    ElementPositioningHelper
} from '../../../misc/helpers/element-positioning.helper';
import {UUID} from '../../../misc/identification/uuid';
import {BreakpointsEnum} from '../../constants/breakpoints.constant';
import {COLORS} from '../../constants/colors.constant';
import {Z_INDEX} from '../../constants/z-index.constants';
import {FlyoutService} from '../service/flyout.service';

const OVERLAY_CSS_CLASS = 'overlay';
export const OPEN_FLYOUT_CSS_CLASS = 'ss-flyout--open';
export const OVERLAY_TRANSPARENT_CSS_CLASS = 'overlay--transparent';
export const FLYOUT_TRANSITION_DURATION = 150;

export enum FlyoutOpenTriggerEnum {
    Click = 'click',
    Hover = 'hover',
    Focus = 'focus',
}

export enum FlyoutCloseTriggerEnum {
    Blur = 'blur',
    Key = 'key',
}

@Directive({
    selector: '[ssFlyout]',
})
export class FlyoutDirective implements OnInit, OnChanges, OnDestroy {

    @Input()
    public flyoutComponent: any;

    @Input()
    public set flyoutTrigger(trigger: FlyoutOpenTriggerEnum | FlyoutOpenTriggerEnum[]) {
        this._flyoutTriggers = typeof trigger === 'string' ? [trigger] : trigger;

        if (this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Hover)) {
            this.flyoutShowOverlay = false;
        }
    }

    @Input()
    public set flyoutTriggerElement(flyoutTriggerElement: ElementRef) {
        if (flyoutTriggerElement) {
            this._elementRef = flyoutTriggerElement;
            this._animatePositionChange(this._updateFlyoutPosition.bind(this));
        }
    }

    @Input()
    public set flyoutCloseTrigger(trigger: FlyoutCloseTriggerEnum | FlyoutCloseTriggerEnum[]) {
        this._flyoutCloseTriggers = typeof trigger === 'string' ? [trigger] : trigger;
    }

    @Input()
    public flyoutComponentProperties: Object = {};

    @Input()
    public flyoutId = `ss-flyout-${UUID.v4()}`;

    @Input()
    public flyoutPosition: ElementPosition = 'below';

    @Input()
    public flyoutAlignment: ElementAlignment = 'end';

    @Input()
    public flyoutOverTrigger = false;

    @Input()
    public flyoutMobileDrawer = false;

    @Input()
    public flyoutShowOverlay = true;

    @Input()
    public flyoutTemplate: TemplateRef<any>;

    @Input()
    public flyoutTemplateProperties: Object = {};

    @Input()
    public flyoutContentZIndex = Z_INDEX.index__1000;

    @Input()
    public flyoutUseTriggerWidth = false;

    @Input()
    public flyoutCloseKeyTriggers: KeyEnum[] = [];

    @Output()
    public flyoutInitialized: EventEmitter<string> = new EventEmitter<string>();

    private _flyoutComponentRef: ComponentRef<any>;

    private _overlay: Element;

    private _instance: Element;

    private _instanceCloseEvent: Observable<EventEmitter<any>> = NEVER;

    private _instanceView: EmbeddedViewRef<any> | ViewRef;

    private _isFlyoutVisible = false;

    private _flyoutTriggers: FlyoutOpenTriggerEnum[] = [FlyoutOpenTriggerEnum.Click];

    private _flyoutCloseTriggers: FlyoutCloseTriggerEnum[] = [];

    private _flyoutPositionInstance: ElementPositioningHelper;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _disposableFlyoutOpenSubscriptions: Subscription = new Subscription();

    @HostListener('click')
    private _onClick() {
        if (this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Click) && !this._isFlyoutVisible) {
            this._openFlyout();
        }
    }

    @HostListener('mouseenter')
    private _onMouseEnter() {
        if (this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Hover) && !this._isFlyoutVisible) {
            this._openFlyout();
        }
    }

    @HostListener('mouseleave', ['$event.relatedTarget'])
    private _onMouseLeave(target: Node) {
        if (this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Hover) && !this._instance.contains(target)) {
            this._flyoutService.close(this.flyoutId);
        }
    }

    @HostListener('focus')
    private _onFocus() {
        if (this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Focus) && !this._isFlyoutVisible) {
            this._openFlyout();
        }
    }

    constructor(private _applicationRef: ApplicationRef,
                private _backdropClickHelper: BackdropClickHelper,
                private _breakpointHelper: BreakpointHelper,
                private _elementRef: ElementRef,
                private _flyoutService: FlyoutService,
                private _ngZone: NgZone,
                private _renderer: Renderer2) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this.flyoutInitialized.emit(this.flyoutId);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this._isFlyoutVisible &&
            changes.hasOwnProperty('flyoutComponentProperties') &&
            !isEqual(changes.flyoutComponentProperties.currentValue, changes.flyoutComponentProperties.previousValue)) {
            this._setComponentProperties();
        }
    }

    ngOnDestroy() {
        if (this._isFlyoutVisible) {
            this._closeFlyout();
        }
        this._unsetSubscriptions();
        this._unsetFlyoutOpenSubscriptions();
        this._destroyAndDetachInstanceView();
    }

    private _animatePositionChange(changePositionFn: () => any): void {
        this._setPositionChangeAnimation(this._instance);
        changePositionFn();
        setTimeout(() => this._setDefaultTransitionAnimation(this._instance), FLYOUT_TRANSITION_DURATION);
    }

    private _setDefaultTransitionAnimation(component: Element): void {
        this._renderer.setStyle(component, 'transition', `opacity ${FLYOUT_TRANSITION_DURATION}ms ease-in-out`);
    }

    private _setPositionChangeAnimation(component: Element): void {
        const style = `opacity ${FLYOUT_TRANSITION_DURATION}ms ease-in-out,
         left ${FLYOUT_TRANSITION_DURATION}ms linear,
         top ${FLYOUT_TRANSITION_DURATION}ms linear`;
        this._renderer.setStyle(component, 'transition', style);
    }

    /**
     * @description Set component and populate it with the provided properties
     */
    private _setComponent(): void {
        const environmentInjector = this._applicationRef.injector;

        this._flyoutComponentRef = createComponent(this.flyoutComponent, {environmentInjector});
    }

    private _setComponentProperties(): void {
        Object
            .keys(this.flyoutComponentProperties)
            .forEach(key => this._flyoutComponentRef.instance[key] = this.flyoutComponentProperties[key]);
    }

    private _setInstanceAttributes(component: Element): void {
        this._renderer.setAttribute(component, 'id', 'flyout');
        this._renderer.setAttribute(component, 'data-automation', 'flyout-component');
        this._renderer.addClass(component, this.flyoutId);
    }

    private _setInstanceDefaultStyles(component: Element): void {
        this._renderer.setStyle(component, 'position', 'fixed');
        this._renderer.setStyle(component, 'z-index', this.flyoutContentZIndex);
        this._renderer.setStyle(component, 'opacity', '0');
        this._renderer.setStyle(component, 'overflow', 'hidden');
        this._renderer.setStyle(component, 'box-shadow', '0 20px 50px 0 rgba(0, 0, 0, 0.1)');
        this._renderer.setStyle(component, 'border', `1px solid  ${COLORS.light_grey_25}`);
        this._renderer.setStyle(component, 'border-bottom-color', COLORS.light_grey_75);
        this._setDefaultTransitionAnimation(component);
    }

    /**
     * @description Style the flyout for mobile resolutions
     * @param {Element} component
     */
    private _styleMobileFlyout(component: Element): void {
        this._renderer.setStyle(component, 'bottom', '0px');
        this._renderer.setStyle(component, 'top', 'unset');
        this._renderer.setStyle(component, 'left', '0px');
        this._renderer.setStyle(component, 'width', '100%');
        this._renderer.setStyle(component, 'max-height', `${window.innerHeight - 16}px`);
    }

    /**
     * @description Style the flyout for desktop resolutions
     * @param {Element} component
     */
    private _styleDesktopFlyout(component: Element): void {
        this._renderer.setStyle(component, 'bottom', 'unset');
        this._renderer.setStyle(component, 'left', 'unset');
        this._renderer.setStyle(component, 'width', 'auto');
        this._renderer.setStyle(component, 'max-height', `${window.innerHeight - 32}px`);

        this._updateFlyoutPosition();
    }

    private _updateFlyoutPosition(): void {
        this._setFlyoutWidth();
        this._setFlyoutPositionInstance();
        this._setFlyoutPosition(this._getFlyoutPosition());
    }

    private _setFlyoutWidth(): void {
        const component = this._instance;
        const trigger = this._elementRef.nativeElement;

        if (this.flyoutUseTriggerWidth) {
            this._renderer.setStyle(component, 'width', `${trigger.getBoundingClientRect().width}px`);
        }
    }

    private _setFlyoutPosition(position): void {
        this._renderer.setStyle(this._instance, 'top', `${position.y}px`);
        this._renderer.setStyle(this._instance, 'left', `${position.x}px`);
    }

    private _getFlyoutPosition(): { x; y } {
        return this._flyoutPositionInstance.getCoordinates();
    }

    private _setFlyoutPositionInstance(): void {
        this._flyoutPositionInstance = new ElementPositioningHelper(this._elementRef.nativeElement,
            this._instance,
            this.flyoutAlignment,
            this.flyoutPosition,
            this.flyoutOverTrigger);
    }

    /**
     * @description Set styles for mobile or desktop views
     * @description The setTimeout is important so that the element is already renderer and the dimension correct
     * @description resulting in correct coordinates calculations
     * @param {Element} component
     */
    private _setInstanceViewSpecificStyles(component: Element): void {
        setTimeout(() => {
            if (this._canShowMobileDrawer()) {
                this._styleMobileFlyout(component);
            } else {
                this._styleDesktopFlyout(component);
            }
        }, 0);
    }

    /**
     * @description Sets flyout opacity
     * @description The setTimeout let the CSS transition be visible
     * @param component
     * @param opacity
     * @private
     */
    private _setInstanceOpacity(component: Element, opacity): void {
        setTimeout(() => this._renderer.setStyle(component, 'opacity', opacity), 0);
    }

    private _createOverlay(): void {
        const overlay = this._renderer.createElement('div');

        this._renderer.addClass(overlay, OVERLAY_CSS_CLASS);
        if (!this._canShowMobileDrawer()) {
            this._renderer.addClass(overlay, OVERLAY_TRANSPARENT_CSS_CLASS);
        }
        this._renderer.setStyle(overlay, 'z-index', this.flyoutContentZIndex);
        this._renderer.insertBefore(document.body, overlay, this._instance);

        this._overlay = overlay;
    }

    private _updateOverlay(): void {
        if (!this._overlay && this._canShowOverlay()) {
            this._createOverlay();
            this._hideScroll();
        } else if (this._overlay && !this._canShowOverlay()) {
            this._removeOverlay();
            this._showScroll();
        }

        if (this._overlay) {
            if (this._canShowMobileDrawer()) {
                this._renderer.removeClass(this._overlay, OVERLAY_TRANSPARENT_CSS_CLASS);
            } else {
                this._renderer.addClass(this._overlay, OVERLAY_TRANSPARENT_CSS_CLASS);
            }
        }
    }

    private _isFlyoutOpen(): boolean {
        return this._flyoutService.isFlyoutOpen(this.flyoutId);
    }

    /**
     * @description Fades in and opens the flyout
     * @private
     */
    private _openFlyout(): void {
        this._isFlyoutVisible = true;
        if (this.flyoutComponent) {
            this._setComponent();
        }
        if (!this._isFlyoutOpen()) {
            this._flyoutService.open(this.flyoutId);
        }

        this._initializeInstance();
        this._addClassToTrigger();

        if (this._canShowOverlay()) {
            this._createOverlay();
            this._hideScroll();
        }

        this._setFlyoutOpenSubscriptions();
    }

    /**
     * @description Fades out and closes the flyout
     * @description The setTimeout let the CSS transition be visible before removing the element from the DOM
     * @private
     */
    private _closeFlyout(): void {
        this._unsetFlyoutOpenSubscriptions();
        this._flyoutService.close(this.flyoutId);
        this._isFlyoutVisible = this._isFlyoutOpen();

        this._removeClassFromTrigger();
        this._removeOverlay();
        this._showScroll();
        this._destroyAndDetachInstanceView();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._flyoutService.openEvents
                .pipe(filter((id) => id === this.flyoutId && !this._isFlyoutVisible))
                .subscribe(() => this._openFlyout())
        );
    }

    private _setFlyoutOpenSubscriptions(): void {
        this._disposableFlyoutOpenSubscriptions = new Subscription();

        const instanceCloseEvent$ = this._instanceCloseEvent;

        const serviceCloseEvent$ = this._flyoutService.closeEvents
            .pipe(filter(flyoutId => flyoutId === this.flyoutId));

        const keyEvent$ = fromEvent(document, 'keydown')
            .pipe(filter((ev: KeyboardEvent) => this.flyoutCloseKeyTriggers.includes(ev.key as KeyEnum)));

        const blurEvent$ = fromEvent(this._elementRef.nativeElement, 'blur')
            .pipe(filter(() => this._flyoutCloseTriggers.includes(FlyoutCloseTriggerEnum.Blur)));

        const mouseleaveEvent$ = fromEvent(this._instance, 'mouseleave')
            .pipe(filter((ev: MouseEvent) => this._flyoutTriggers.includes(FlyoutOpenTriggerEnum.Hover)
                && !this._elementRef.nativeElement.contains(ev.relatedTarget)));

        const clickEvent$ = this._backdropClickHelper.observe([BackdropClickEventTypeEnum.MouseDown], (ev: Event) => {
            const clickInsideFlyout = this._instance && this._instance.contains(ev.target as Node);
            const clickInsideTrigger = this._elementRef.nativeElement.contains(ev.target as Node);
            const targetIsInDocument = document.contains && document.contains(ev.target as Node)
                || document.body.contains(ev.target as Node);

            return !clickInsideFlyout && !clickInsideTrigger && targetIsInDocument;
        });

        const closeEvents$ = merge(
            instanceCloseEvent$,
            serviceCloseEvent$,
            clickEvent$,
            keyEvent$,
            blurEvent$,
            mouseleaveEvent$
        );

        this._disposableFlyoutOpenSubscriptions.add(
            closeEvents$
                .pipe(filter(() => this._isFlyoutVisible))
                .subscribe(() => this._closeFlyout())
        );

        this._disposableFlyoutOpenSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => {
                    this._setInstanceViewSpecificStyles(this._instance);
                    this._updateOverlay();
                })
        );

        this._ngZone.runOutsideAngular(() => {
            this._disposableFlyoutOpenSubscriptions.add(
                scheduled(interval(0), animationFrameScheduler)
                    .pipe(
                        filter(() => !!this._flyoutPositionInstance && !this._canShowMobileDrawer()),
                        map(() => this._getFlyoutPosition()),
                        distinctUntilChanged(isEqual),
                    )
                    .subscribe(position => {
                        this._setFlyoutPosition(position);
                    })
            );
        });
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _unsetFlyoutOpenSubscriptions(): void {
        this._disposableFlyoutOpenSubscriptions.unsubscribe();
    }

    private _removeOverlay(): void {
        if (this._overlay) {
            this._renderer.removeChild(this._overlay.parentNode, this._overlay);
            this._overlay = null;
        }
    }

    private _canShowMobileDrawer(): boolean {
        return this.flyoutMobileDrawer && window.innerWidth < BreakpointsEnum.md;
    }

    private _canShowOverlay(): boolean {
        return this.flyoutShowOverlay || this._canShowMobileDrawer();
    }

    private _hideScroll(): void {
        this._renderer.addClass(document.body, OPEN_FLYOUT_CSS_CLASS);
    }

    private _showScroll(): void {
        this._renderer.removeClass(document.body, OPEN_FLYOUT_CSS_CLASS);
    }

    private _addClassToTrigger(): void {
        this._renderer.addClass(this._elementRef.nativeElement, OPEN_FLYOUT_CSS_CLASS);
    }

    private _removeClassFromTrigger(): void {
        this._renderer.removeClass(this._elementRef.nativeElement, OPEN_FLYOUT_CSS_CLASS);
    }

    private _attachInstanceView() {
        this._applicationRef.attachView(this._instanceView);
    }

    private _destroyAndDetachInstanceView(): void {
        if (this._instanceView) {
            this._instanceView.destroy();
        }
    }

    private _initializeInstance() {
        this._setInstance();
        this._attachInstanceView();
        this._setInstanceAttributes(this._instance);
        this._setInstanceDefaultStyles(this._instance);
        this._setInstanceViewSpecificStyles(this._instance);
        this._setInstanceOpacity(this._instance, 1);

        this._renderInstance();
    }

    private _renderInstance() {
        this._renderer.appendChild(document.body, this._instance);
    }

    private _setInstance() {
        if (this.flyoutComponent) {
            this._setComponentInstance();
        } else {
            this._setTemplateInstance();
        }
    }

    private _setComponentInstance(): void {
        this._setComponentProperties();
        this._instance = (this._flyoutComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as Element;
        this._instanceCloseEvent = this._flyoutComponentRef.instance.close || NEVER;
        this._instanceView = this._flyoutComponentRef.hostView;
    }

    private _setTemplateInstance(): void {
        const flyoutTemplateRef: EmbeddedViewRef<any> = this.flyoutTemplate.createEmbeddedView({$implicit: this.flyoutTemplateProperties});

        this._instance = flyoutTemplateRef.rootNodes[0] as Element;
        this._instanceView = flyoutTemplateRef;
    }
}

export interface FlyoutModel {
    id: string;
    closeKeyTriggers?: KeyEnum[];
    component: Type<any>;
    properties?: Object;
    position?: ElementPosition;
    alignment?: ElementAlignment;
    mobileDrawer?: boolean;
    overTrigger?: boolean;
    trigger?: FlyoutOpenTriggerEnum | FlyoutOpenTriggerEnum[];
    triggerElement?: ElementRef;
}
