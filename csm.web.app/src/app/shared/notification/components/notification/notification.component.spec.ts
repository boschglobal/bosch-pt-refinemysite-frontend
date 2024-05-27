/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {cloneDeep} from 'lodash';

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {
    NOTIFICATION_MOCK,
    NOTIFICATION_MOCK_2
} from '../../../../../test/mocks/notifications';
import {DateHelperStub} from '../../../../../test/stubs/date.helper.stub';
import {BlobService} from '../../../rest/services/blob.service';
import {DateHelper} from '../../../ui/dates/date.helper.service';
import {UIModule} from '../../../ui/ui.module';
import {NotificationComponent} from './notification.component';

describe('Notification Component', () => {

    let fixture: ComponentFixture<NotificationComponent>;
    let comp: NotificationComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationTitleSelector = '[data-automation="notification-title"]';
    const dataAutomationDateSelector = '[data-automation="notification-date"]';
    const dataAutomationDescriptionSelector = '[data-automation="notification-description"]';
    const dataAutomationContextSelector = '[data-automation="notification-context"]';
    const dataAutomationNotificationSelector = '[data-automation="notification"]';

    const getTitle = (): Element => el.querySelector(dataAutomationTitleSelector);
    const getDate = (): Element => el.querySelector(dataAutomationDateSelector);
    const getDescription = (): Element => el.querySelector(dataAutomationDescriptionSelector);
    const getContext = (): Element => el.querySelector(dataAutomationContextSelector);
    const getNotification = (): Element => el.querySelector(dataAutomationNotificationSelector);

    const moduleDef: TestModuleMetadata = {
        declarations: [
            NotificationComponent
        ],
        imports: [
            UIModule
        ],
        providers: [
            {
                provide: BlobService,
                useValue: new BlobServiceMock()
            },
            {
                provide: DateHelper,
                useValue: new DateHelperStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NotificationComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.notification = cloneDeep(NOTIFICATION_MOCK);

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should display the correct date', () => {
        const expectedDate = NOTIFICATION_MOCK.date;

        expect(getDate().textContent).toEqual(expectedDate);
    });

    it('should display the correct title', () => {
        const {template, values} = NOTIFICATION_MOCK.summary;
        const expectedTitle = template.replace('${actor}', values['actor'].text);

        expect(getTitle().textContent).toEqual(expectedTitle);
    });

    it('should display the correct title when a value is missing to fill the template', () => {
        const {template, values} = NOTIFICATION_MOCK_2.summary;
        const expectedTitle = template.replace('${actor}', values['actor'].text);

        comp.notification = cloneDeep(NOTIFICATION_MOCK_2);

        fixture.detectChanges();

        expect(getTitle().textContent).toEqual(expectedTitle);
    });

    it('should display the correct description', () => {
        const expectedDescription = NOTIFICATION_MOCK.changes;

        expect(getDescription().textContent).toEqual(expectedDescription);
    });

    it('should not display description tag', () => {
        comp.notification.changes = null;
        fixture.detectChanges();

        expect(getDescription()).toBeFalsy();
    });

    it('should display the correct context', () => {
        const expectedTask = NOTIFICATION_MOCK.context['task'].displayName;
        const expectedProject = NOTIFICATION_MOCK.context['project'].displayName;

        const expectedContext = `${expectedTask} · ${expectedProject}`;

        expect(getContext().textContent).toEqual(expectedContext);
    });

    it('should change read class when read state change', () => {
        const readClass = 'ss-notification--read';

        expect(getNotification().classList).not.toContain(readClass);

        comp.notification.read = true;
        fixture.detectChanges();

        expect(getNotification().classList).toContain(readClass);
    });

});
