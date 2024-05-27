/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {of} from 'rxjs';

import {MockStore} from '../../../../../test/mocks/store';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {LocalStorageService} from '../../../local-storage/api/local-storage.service';
import {IconModule} from '../../../ui/icons/icon.module';
import {UIModule} from '../../../ui/ui.module';
import {NewsArticle} from '../../models/news-article.model';
import {HelpSectionComponent} from './help-section.component';

describe('Help Section Component', () => {
    let fixture: ComponentFixture<HelpSectionComponent>;
    let component: HelpSectionComponent;
    let userQueries: UserQueries;
    let localStorageService: LocalStorageService;

    const dataAutomationPanel = `[data-automation="help-panel"]`;
    const dataAutomationButton = `[data-automation="help-button"]`;
    const dataAutomationUserGuide = `[data-automation="help-panel-user-guide"]`;
    const dataAutomationCustomerSupport = `[data-automation="help-panel-customer-support"]`;
    const dataAutomationWhatsNewTitle = `[data-automation="help-panel-whats-new-title"]`;

    const whatsNewArticles: NewsArticle[] = [
        {
            id: '1',
            title: 'WhatsNew_NonWorkingDays_Title',
            date: new Date('2023-06-27T01:00:00'),
            textContent: 'WhatsNew_NonWorkingDays_Content',
            image: {
                path: 'assets/images/whats-new/non-working-days.png',
                alt: 'non-working-days',
            },
        },
        {
            id: '2',
            title: 'WhatsNew_NonWorkingDays_Title',
            date: new Date('2023-08-30T01:00:00'),
            textContent: 'WhatsNew_NonWorkingDays_Content',
            image: {
                path: 'assets/images/whats-new/non-working-days.png',
                alt: 'non-working-days',
            },
        },
    ];

    const whatsNewArticlesSorted: NewsArticle[] = [
        {
            id: '2',
            title: 'WhatsNew_NonWorkingDays_Title',
            date: new Date('2023-08-30T01:00:00'),
            textContent: 'WhatsNew_NonWorkingDays_Content',
            image: {
                path: 'assets/images/whats-new/non-working-days.png',
                alt: 'non-working-days',
            },
        },
        {
            id: '1',
            title: 'WhatsNew_NonWorkingDays_Title',
            date: new Date('2023-06-27T01:00:00'),
            textContent: 'WhatsNew_NonWorkingDays_Content',
            image: {
                path: 'assets/images/whats-new/non-working-days.png',
                alt: 'non-working-days',
            },
        },
    ];

    const getDebugElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector)) || null;
    const getElement = (selector: string): HTMLElement => getDebugElement(selector)?.nativeElement;

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        declarations: [
            HelpSectionComponent,
        ],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
            TranslateModule,
            UIModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpSectionComponent);
        component = fixture.componentInstance;
        userQueries = TestBed.inject(UserQueries);
        localStorageService = TestBed.inject(LocalStorageService);

        spyOn(userQueries, 'getCurrentState').and.returnValue(of(TEST_USER_RESOURCE_REGISTERED));

        component.isPanelOpen = true;
        component.whatsNewArticles = whatsNewArticles;

        fixture.detectChanges();
    });

    it('should close panel when click outside of the help section', () => {
        expect(getElement(dataAutomationPanel)).toBeDefined();

        document.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).not.toBeDefined();
    });

    it('should not open the panel when click outside of the help section', () => {
        expect(getElement(dataAutomationPanel)).toBeDefined();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).not.toBeDefined();

        document.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).not.toBeDefined();
    });

    it('should open the panel when closed and the help button is clicked', () => {
        expect(getElement(dataAutomationPanel)).toBeDefined();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).not.toBeDefined();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeDefined();
    });

    it('should close the panel when opened and the help button is clicked', () => {
        expect(getElement(dataAutomationPanel)).toBeDefined();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).not.toBeDefined();
    });

    it('should show user guide option when help section is open', () => {
        expect(getElement(dataAutomationUserGuide)).toBeDefined();
    });

    it('should not show user guide option when help section is closed', () => {
        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationUserGuide)).not.toBeDefined();
    });

    it('should redirect user to correct link', () => {
        expect(getElement(dataAutomationUserGuide).getAttribute('href')).toBe('Generic_UserGuide_Link');
    });

    it('should open user email app, with a new email to the support email', () => {
        expect(getElement(dataAutomationCustomerSupport).getAttribute('href')).
            toBe('mailto:Generic_SupportEmail?Subject=Generic_SupportEmail_Subject');
    });

    it('should show customer support option when help section is open', () => {
        expect(getElement(dataAutomationCustomerSupport)).toBeDefined();
    });

    it('should not show customer support option when help section is closed', () => {
        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationCustomerSupport)).not.toBeDefined();
    });

    it('should show correct whats new header', () => {
        expect(getElement(dataAutomationWhatsNewTitle).innerText).toBe('Generic_WhatsNew');
    });

    it('should show badge on icon when the user has articles to read', () => {
        spyOn(localStorageService, 'findWhatsNewReadArticles').and.returnValue(whatsNewArticles[0].id);

        component.ngOnInit();

        expect(component.hasUnreadArticles).toBeTruthy();
    });

    it('should not show badge on icon when the user has not articles to read', () => {
        spyOn(localStorageService, 'findWhatsNewReadArticles').and.returnValue(whatsNewArticles.map(article => article.id));

        component.ngOnInit();

        expect(component.hasUnreadArticles).toBeFalsy();
    });

    it('should show badge on icon when the user has articles to read and remove it when the user opens the help section', () => {
        spyOn(localStorageService, 'findWhatsNewReadArticles').and.returnValues([],
            whatsNewArticles.map(article => article.id));

        component.ngOnInit();
        expect(component.hasUnreadArticles).toBeTruthy();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        getElement(dataAutomationButton).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.hasUnreadArticles).toBeFalsy();
    });

    it('should show the list sorted by most recent date when loaded', () => {
        component.whatsNewArticles = whatsNewArticles;

        component.ngOnInit();

        expect(component.whatsNewArticles).toEqual(whatsNewArticlesSorted);
    });
});
