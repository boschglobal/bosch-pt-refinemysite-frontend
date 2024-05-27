/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    ElementRef,
    Renderer2
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    setEventKey,
    updateWindowInnerHeight,
    updateWindowInnerWidth,
    updateWindowScrollY
} from '../../../../../test/helpers';
import {MockCallService} from '../../../../../test/mocks/services/mock-call.service';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE} from '../../constants/breakpoints.constant';
import {FlyoutTestComponent} from '../flyout.test.component';
import {FlyoutContentTestComponent} from '../flyout-content.test.component';
import {FlyoutService} from '../service/flyout.service';
import {
    FLYOUT_TRANSITION_DURATION,
    FlyoutCloseTriggerEnum,
    FlyoutDirective,
    FlyoutOpenTriggerEnum,
    OPEN_FLYOUT_CSS_CLASS,
    OVERLAY_TRANSPARENT_CSS_CLASS
} from './flyout.directive';

describe('Flyout Directive', () => {
    let fixture: ComponentFixture<FlyoutTestComponent>;
    let comp: FlyoutTestComponent;
    let de: DebugElement;
    let flyoutService: FlyoutService;
    let mockCallService: MockCallService;

    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const breakpointChange$: Subject<string> = new Subject();

    const dataAutomationFlyoutComponentTrigger = '[data-automation="flyout-trigger-component"]';
    const dataAutomationFlyoutComponentTriggerNew = '[data-automation="flyout-trigger-component-new"]';
    const dataAutomationFlyoutComponentContent = '[data-automation="flyout-component-content"]';
    const dataAutomationFlyoutComponentWrapper = '[data-automation="flyout-component-wrapper"]';
    const dataAutomationFlyoutTemplateTrigger = '[data-automation="flyout-trigger-template"]';
    const dataAutomationFlyoutTemplateContent = '[data-automation="flyout-template-content"]';
    const dataAutomationFlyout = '#flyout';
    const dataAutomationOverlay = '.overlay';
    const bodyHiddenScroll = 'body.ss-flyout--open';

    const initialInnerWidth: number = window.innerWidth;
    const initialInnerHeight: number = window.innerHeight;
    const initialWindowScrollY: number = window.scrollY;

    const clickEvent: Event = new Event('click');
    const mouseDownEvent: Event = new MouseEvent('mousedown', {bubbles: true});
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');
    const mouseEnterEvent: Event = new Event('mouseenter');
    const mouseLeaveEvent: Event = new Event('mouseleave');
    const keyDownEvent: KeyboardEvent = new KeyboardEvent('keydown');

    const scrollIsHidden = () => document.querySelector(bodyHiddenScroll) != null;

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const getFlyout = () => document.querySelector(dataAutomationFlyout);

    const getOverlay = () => document.querySelector(dataAutomationOverlay);

    const getFlyoutComponentContent = () => document.querySelector(dataAutomationFlyoutComponentContent);

    const getFlyoutComponentWrapper = () => document.querySelector(dataAutomationFlyoutComponentWrapper);

    const getFlyoutTemplateContent = () => document.querySelector(dataAutomationFlyoutTemplateContent);

    const clearFlyout = () => {
        if (getFlyout()) {
            getFlyout().remove();
        }

        if (getOverlay()) {
            getOverlay().remove();
        }
    };

    const mouseLeaveToDocumentBodyEvent: MouseEvent = new MouseEvent('mouseleave', {relatedTarget: document.body});

    const moduleDef: TestModuleMetadata = {
        declarations: [
            FlyoutContentTestComponent,
            FlyoutDirective,
            FlyoutTestComponent,
        ],
        providers: [
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
            MockCallService,
            {
                provide: Renderer2,
                useValue: jasmine.createSpyObj('Renderer2', [
                    'createElement',
                    'appendChild',
                    'removeChild',
                    'setAttribute',
                    'addClass',
                    'setStyle',
                    'listen',
                ]),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(breakpointHelperMock.breakpointChange()).thenReturn(breakpointChange$);
        fixture = TestBed.createComponent(FlyoutTestComponent);
        flyoutService = TestBed.inject(FlyoutService);
        mockCallService = TestBed.inject(MockCallService);
        fixture.detectChanges();
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Click;
        fixture.detectChanges();
    });

    afterEach(() => {
        clearFlyout();
        updateWindowInnerWidth(initialInnerWidth);
        updateWindowInnerHeight(initialInnerHeight);
        updateWindowScrollY(initialWindowScrollY);
        window.scrollTo(0, initialWindowScrollY);

        fixture.destroy();
    });

    it('should create the flyout', () => {
        expect(comp).toBeDefined();
    });

    it('should create the flyout on click via a component defined element', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        expect(getFlyout()).not.toBeNull();
        expect(scrollIsHidden()).toBeTruthy();
    });

    it('should create the flyout on click via a template defined element', () => {
        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);

        expect(getFlyout()).not.toBeNull();
        expect(scrollIsHidden()).toBeTruthy();
    });

    it('should render flyout content based on a component element', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyoutComponentContent()).not.toBeNull();
    });

    it('should render flyout content based on a template element', () => {
        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).not.toBeNull();
    });

    it('should restrict height of flyout to the height of the window minus 32 in large resolutions', fakeAsync(() => {
        const windowHeight = 80;
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        updateWindowInnerHeight(windowHeight);
        comp.flyoutMobileDrawer = false;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        tick(1);
        expect(getFlyout().getAttribute('style')).toContain(`max-height: ${windowHeight - 32}px`);
    }));

    it('should restrict height of flyout to the height of the window minus 16 in small resolutions', fakeAsync(() => {
        const windowHeight = 80;
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        updateWindowInnerHeight(windowHeight);
        comp.flyoutMobileDrawer = true;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();
        tick(1);

        expect(getFlyout().getAttribute('style')).toContain(`max-height: ${windowHeight - 16}px`);
    }));

    it('should hide browser scroll and fix flyout to the bottom when flyout is launched in small resolution device', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        comp.flyoutMobileDrawer = true;

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        tick(1);

        const styles = getFlyout().getAttribute('style');
        expect(document.body.classList).toContain('ss-flyout--open');
        expect(styles).toContain('bottom: 0px');
        expect(styles).toContain('top: unset');
        expect(styles).toContain('left: 0px');
        expect(styles).toContain('width: 100%');
    }));

    it('should not fix flyout to the bottom when flyout is launched in large resolution device', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        comp.flyoutMobileDrawer = false;

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        tick(1);

        const styles = getFlyout().getAttribute('style');
        expect(styles).toContain('bottom: unset');
        expect(styles).toContain('width: auto');
        expect(styles['left']).not.toBe('0px');
    }));

    it('should set flyout component properties on open', () => {
        const content = 'foo';
        comp.flyoutProperties = {
            content,
        };
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();
        expect(getFlyoutComponentContent().textContent).toBe(content);
    });

    it('should update flyout component properties when they are changed and flyout is open', () => {
        const content = 'foo';
        const contentAfterChange = 'bar';

        comp.flyoutProperties = {
            content,
        };
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        expect(getFlyoutComponentContent().textContent).toBe(content);

        comp.flyoutProperties = {
            content: contentAfterChange,
        };
        fixture.detectChanges();

        expect(getFlyoutComponentContent().textContent).toBe(contentAfterChange);
    });

    it('should set flyout template properties on open', () => {
        const content = 'foo';

        comp.flyoutTemplateProperties = {
            content,
        };
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyoutTemplateContent().textContent).toBe(content);
    });

    it('should close flyout and remove component content when user clicks on the overlay', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getOverlay().dispatchEvent(mouseDownEvent);

        fixture.detectChanges();

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should close flyout and remove template content when user clicks on the overlay', () => {
        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getOverlay().dispatchEvent(mouseDownEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should close flyout and remove template content when overlay does not exist ' +
        'and user clicks outside trigger or flyout content', () => {
        comp.flyoutShowOverlay = false;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);

        expect(getFlyout()).not.toBeNull();

        document.dispatchEvent(mouseDownEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should not close flyout and remove template content when overlay does not exist ' +
        'and user clicks in trigger or flyout content', () => () => {
        comp.flyoutShowOverlay = false;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);

        expect(getFlyout()).not.toBeNull();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);
        getElement(dataAutomationFlyoutTemplateContent).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).not.toBeNull();
        expect(getFlyout()).not.toBeNull();

    });

    it('should close flyout on destroy', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        fixture.destroy();

        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should destroy the view when the flyout is closed and the element is defined via component', () => {
        spyOn(mockCallService, 'call');

        flyoutService.open(comp.flyoutComponentId);
        flyoutService.close(comp.flyoutComponentId);

        expect(mockCallService.call).toHaveBeenCalled();
    });

    it('should destroy the view when the flyout is closed and the element is defined via template', () => {
        spyOn(mockCallService, 'call');

        flyoutService.open(comp.flyoutTemplateId);
        flyoutService.close(comp.flyoutTemplateId);

        expect(mockCallService.call).toHaveBeenCalled();
    });

    it('should destroy the view when the flyout is destroyed', () => {
        spyOn(mockCallService, 'call');

        flyoutService.open(comp.flyoutComponentId);
        fixture.destroy();

        expect(mockCallService.call).toHaveBeenCalled();
    });

    it('should not destroy the view when the flyout is destroyed but was already closed', () => {
        flyoutService.open(comp.flyoutComponentId);
        flyoutService.close(comp.flyoutComponentId);

        spyOn(mockCallService, 'call');

        fixture.destroy();

        expect(mockCallService.call).not.toHaveBeenCalled();
    });

    it('should create the flyout on hover via a component defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseEnterEvent);

        expect(getFlyout()).not.toBeNull();
        expect(getFlyoutComponentContent()).not.toBeNull();
    });

    it('should not hide scroll on hover via a component defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseEnterEvent);

        expect(getFlyout()).not.toBeNull();
        expect(scrollIsHidden()).toBeFalsy();
    });

    it('should close flyout and remove component content when user leaves trigger', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseEnterEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseLeaveEvent);

        fixture.detectChanges();

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should create the flyout on hover via a template defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(mouseEnterEvent);

        expect(getFlyout()).not.toBeNull();
        expect(getFlyoutTemplateContent()).not.toBeNull();
    });

    it('should not hide scroll on hover via a template defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(mouseEnterEvent);

        expect(getFlyout()).not.toBeNull();
        expect(scrollIsHidden()).toBeFalsy();
    });

    it('should close flyout and remove template content when user leaves trigger', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(mouseEnterEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(mouseLeaveEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should close flyout when user leaves the flyout and hovers element that is not the trigger', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseEnterEvent);

        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getFlyout().dispatchEvent(mouseLeaveToDocumentBodyEvent);

        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should not display flyout on mouseover when trigger is click', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseEnterEvent);
        fixture.detectChanges();

        expect(getFlyout()).toBeNull();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(mouseLeaveEvent);
        fixture.detectChanges();

        expect(getFlyout()).toBeNull();

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should not display flyout on click when trigger is hover', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Hover;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).toBeNull();

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should not hide flyout on mouseleave when trigger is click', () => {
        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getFlyoutTemplateContent().dispatchEvent(mouseEnterEvent);
        fixture.detectChanges();

        getFlyoutTemplateContent().dispatchEvent(mouseLeaveEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();
    });

    it('should create flyout on focus via a component defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Focus;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(focusEvent);

        expect(getFlyout()).not.toBeNull();
        expect(scrollIsHidden()).toBeTruthy();
    });

    it('should not create flyout on focus via a component defined element', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should create flyout on focus via a template defined element', () => {
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Focus;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(focusEvent);

        expect(getFlyout()).not.toBeNull();
    });

    it('should not create flyout on focus via a template defined element', () => {
        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getFlyoutTemplateContent()).toBeNull();
        expect(getOverlay()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should create flyout that opens with more then 1 trigger when flyout doest not have overlay', () => {
        comp.flyoutShowOverlay = false;
        comp.flyoutTrigger = [FlyoutOpenTriggerEnum.Click, FlyoutOpenTriggerEnum.Hover, FlyoutOpenTriggerEnum.Focus];
        fixture.detectChanges();

        getElement(dataAutomationFlyoutTemplateTrigger).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();
    });

    it('should close flyout on blur event when flyout does not have overlay', () => {
        comp.flyoutShowOverlay = false;
        comp.flyoutTrigger = FlyoutOpenTriggerEnum.Focus;
        comp.flyoutCloseTrigger = FlyoutCloseTriggerEnum.Blur;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(blurEvent);
        fixture.detectChanges();

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should close flyout on specific key up events when flyout does not have overlay', () => {
        comp.flyoutShowOverlay = false;
        comp.flyoutCloseKeyTriggers = [KeyEnum.Escape, KeyEnum.Tab];
        setEventKey(keyDownEvent, KeyEnum.Tab);

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        document.dispatchEvent(keyDownEvent);

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should close flyout with more then 1 trigger', () => {
        comp.flyoutShowOverlay = false;
        comp.flyoutCloseTrigger = [FlyoutCloseTriggerEnum.Key, FlyoutCloseTriggerEnum.Blur];
        comp.flyoutCloseKeyTriggers = [KeyEnum.Escape, KeyEnum.Tab];
        setEventKey(keyDownEvent, KeyEnum.Tab);

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        document.dispatchEvent(keyDownEvent);

        expect(getFlyoutComponentContent()).toBeNull();
        expect(getFlyout()).toBeNull();
    });

    it('should not render flyout overlay when flyoutShowOverlay is set to false', () => {
        comp.flyoutShowOverlay = false;
        fixture.detectChanges();

        expect(getOverlay()).toBeNull();
    });

    it('should update flyout position on every browser repaint', (done) => {
        const triggerTop = 100;
        let initialFlyoutPositionY;
        let finalFlyoutPositionY;

        getElement(dataAutomationFlyoutComponentTrigger).style.position = 'absolute';
        getElement(dataAutomationFlyoutComponentTrigger).style.top = '0';
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        setTimeout(() => {
            initialFlyoutPositionY = getFlyoutComponentWrapper().getBoundingClientRect().top;

            getElement(dataAutomationFlyoutComponentTrigger).style.top = `${triggerTop}px`;
            fixture.detectChanges();

            setTimeout(() => {
                finalFlyoutPositionY = getFlyoutComponentWrapper().getBoundingClientRect().top;
                expect(finalFlyoutPositionY).toBe(initialFlyoutPositionY + triggerTop);
                done();
            }, 1000);
        }, 1);
    });

    it('should not update flyout position on every browser repaint on Mobile Drawer mode', (done) => {
        const triggerTop = 100;

        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        comp.flyoutMobileDrawer = true;

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).style.position = 'absolute';
        getElement(dataAutomationFlyoutComponentTrigger).style.top = '0';
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();

        setTimeout(() => {
            getElement(dataAutomationFlyoutComponentTrigger).style.position = 'absolute';
            getElement(dataAutomationFlyoutComponentTrigger).style.top = `${triggerTop}px`;
            fixture.detectChanges();

            setTimeout(() => {
                const styles = getFlyout().getAttribute('style');
                expect(styles).toContain('bottom: 0px');
                expect(styles).toContain('top: unset');
                expect(styles).toContain('left: 0px');
                expect(styles).toContain('width: 100%');
                done();
            }, 100);
        }, 1);
    });

    it('should set flyout width the same has the trigger', fakeAsync(() => {
        let flyoutWidth = 0;
        const triggerWidth = getElement(dataAutomationFlyoutComponentTrigger).getBoundingClientRect().width;

        comp.flyoutUseTriggerWidth = true;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getFlyout()).not.toBeNull();
        fixture.detectChanges();

        tick(1);

        flyoutWidth = getFlyoutComponentWrapper().getBoundingClientRect().width;
        expect(flyoutWidth).toEqual(triggerWidth);
    }));

    it('should create flyout via service open events', () => {
        flyoutService.open(comp.flyoutComponentId);

        expect(getFlyout()).not.toBeNull();
    });

    it('should emit flyoutInitialized when flyout directive instance is created', () => {
        const flyoutId = comp.flyoutInitializeId;

        comp.isFlyoutVisible = false;

        fixture.detectChanges();

        spyOn(comp, 'flyoutInitialized');

        comp.isFlyoutVisible = true;

        fixture.detectChanges();

        expect(comp.flyoutInitialized).toHaveBeenCalledWith(flyoutId);
    });

    it('should change flyout position when flyoutTriggerElement is changed', () => {
        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        const oldStyles = Object.assign({}, getFlyout()['style']);

        comp.flyoutTriggerElement = new ElementRef(getElement(dataAutomationFlyoutComponentTriggerNew));
        fixture.detectChanges();

        const newStyles = getFlyout()['style'];
        expect(newStyles['left'] !== oldStyles['left']).toBeTruthy();
        expect(newStyles['top'] !== oldStyles['top']).toBeTruthy();
    });

    it('should animate position and opacity change when flyoutTriggerElement is changed', fakeAsync(() => {
        spyOn(window, 'requestAnimationFrame').and.callFake(() => {
        });
        const positionChangeTransitionStyleLeft = `left ${FLYOUT_TRANSITION_DURATION}ms linear`;
        const positionChangeTransitionStyleTop = `top ${FLYOUT_TRANSITION_DURATION}ms linear`;

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        expect(getFlyout().getAttribute('style')).not.toContain(positionChangeTransitionStyleLeft);
        expect(getFlyout().getAttribute('style')).not.toContain(positionChangeTransitionStyleTop);
        expect(getFlyout().getAttribute('style')).toContain('opacity: 0');

        comp.flyoutTriggerElement = new ElementRef(getElement(dataAutomationFlyoutComponentTriggerNew));
        fixture.detectChanges();

        expect(getFlyout().getAttribute('style')).toContain(positionChangeTransitionStyleTop);
        expect(getFlyout().getAttribute('style')).toContain(positionChangeTransitionStyleLeft);
        expect(getFlyout().getAttribute('style')).toContain(`opacity ${FLYOUT_TRANSITION_DURATION}ms ease-in-out`);

        tick(FLYOUT_TRANSITION_DURATION);

        expect(getFlyout().getAttribute('style')).not.toContain(positionChangeTransitionStyleLeft);
        expect(getFlyout().getAttribute('style')).not.toContain(positionChangeTransitionStyleTop);
        expect(getFlyout().getAttribute('style')).toContain('opacity: 1');
    }));

    it('should apply right styles when transitioning from big screen flyout to mobile flyout', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        comp.flyoutMobileDrawer = true;

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        tick(1);

        const largeScreenStyles = getFlyout().getAttribute('style');
        expect(largeScreenStyles).toContain('bottom: unset');
        expect(largeScreenStyles).toContain('width: auto');
        expect(largeScreenStyles['left']).not.toBe('0px');
        expect(getOverlay()).not.toBeNull();

        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        breakpointChange$.next();
        tick(1);

        const smallScreenStyles = getFlyout().getAttribute('style');
        expect(smallScreenStyles).toContain('bottom: 0px');
        expect(smallScreenStyles).toContain('top: unset');
        expect(smallScreenStyles).toContain('left: 0px');
        expect(smallScreenStyles).toContain('width: 100%');
        expect(getOverlay()).not.toBeNull();
    }));

    it('should apply right styles when transitioning from mobile flyout to big screen flyout', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        comp.flyoutMobileDrawer = true;
        comp.flyoutShowOverlay = false;

        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);

        fixture.detectChanges();

        tick(1);

        const smallScreenStyles = getFlyout().getAttribute('style');
        expect(smallScreenStyles).toContain('bottom: 0px');
        expect(smallScreenStyles).toContain('top: unset');
        expect(smallScreenStyles).toContain('left: 0px');
        expect(smallScreenStyles).toContain('width: 100%');
        expect(getOverlay()).not.toBeNull();

        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        breakpointChange$.next();

        tick(1);

        const largeScreenStyles = getFlyout().getAttribute('style');
        expect(largeScreenStyles).toContain('bottom: unset');
        expect(largeScreenStyles).toContain('width: auto');
        expect(largeScreenStyles['left']).not.toBe('0px');
        expect(getOverlay()).toBeNull();
    }));

    it('should add overlay when transitioning from big screen flyout to mobile flyout', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        comp.flyoutMobileDrawer = true;
        comp.flyoutShowOverlay = false;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();
        tick(1);

        expect(getOverlay()).toBeNull();

        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        breakpointChange$.next();
        tick(1);

        expect(getOverlay()).not.toBeNull();
        expect(getOverlay().classList).not.toContain(OVERLAY_TRANSPARENT_CSS_CLASS);
    }));

    it('should remove OVERLAY_TRANSPARENT_CSS_CLASS when transitioning from big screen flyout to mobile flyout', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        comp.flyoutMobileDrawer = true;
        comp.flyoutShowOverlay = true;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();
        tick(1);

        expect(getOverlay()).not.toBeNull();
        expect(getOverlay().classList).toContain(OVERLAY_TRANSPARENT_CSS_CLASS);

        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        breakpointChange$.next();
        tick(1);

        expect(getOverlay()).not.toBeNull();
        expect(getOverlay().classList).not.toContain(OVERLAY_TRANSPARENT_CSS_CLASS);
    }));

    it('should add OVERLAY_TRANSPARENT_CSS_CLASS when transitioning from mobile flyout to big screen flyout', fakeAsync(() => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);
        comp.flyoutMobileDrawer = true;
        comp.flyoutShowOverlay = true;
        fixture.detectChanges();

        getElement(dataAutomationFlyoutComponentTrigger).dispatchEvent(clickEvent);
        fixture.detectChanges();
        tick(1);

        expect(getOverlay()).not.toBeNull();
        expect(getOverlay().classList).not.toContain(OVERLAY_TRANSPARENT_CSS_CLASS);

        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.min);
        breakpointChange$.next();
        tick(1);

        expect(getOverlay()).not.toBeNull();
        expect(getOverlay().classList).toContain(OVERLAY_TRANSPARENT_CSS_CLASS);
    }));

    it(`should add ${OPEN_FLYOUT_CSS_CLASS} class to the trigger element when flyout is opened`, () => {
        expect(getElement(dataAutomationFlyoutComponentTrigger).classList).not.toContain(OPEN_FLYOUT_CSS_CLASS);

        flyoutService.open(comp.flyoutComponentId);

        expect(getElement(dataAutomationFlyoutComponentTrigger).classList).toContain(OPEN_FLYOUT_CSS_CLASS);
    });

    it(`should remove ${OPEN_FLYOUT_CSS_CLASS} class from the trigger element when flyout is closed`, () => {
        flyoutService.open(comp.flyoutComponentId);
        flyoutService.close(comp.flyoutComponentId);

        expect(getElement(dataAutomationFlyoutComponentTrigger).classList).not.toContain(OPEN_FLYOUT_CSS_CLASS);
    });
});
