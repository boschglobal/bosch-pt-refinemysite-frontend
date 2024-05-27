/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ANNOUNCEMENTS_LIST_MOCK} from '../../../../../test/mocks/announcements';
import {MockStore} from '../../../../../test/mocks/store';
import {State} from '../../../../app.reducers';
import {SystemHelper} from '../../../misc/helpers/system.helper';
import {CalloutComponent} from '../../presentationals/callout/callout.component';
import {AlertActions} from '../../store/alert.actions';
import {AlertQueries} from '../../store/alert.queries';
import {AnnouncementListComponent} from './announcement-list.component';

describe('Announcements List Component', () => {
    let component: AnnouncementListComponent;
    let fixture: ComponentFixture<AnnouncementListComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<State>;

    const announcementSelector = '[data-automation="announcement-list-announcement"]';
    const deprecatedBrowserSelector = '[data-automation="announcement-list-deprecated-browser"]';
    const dataAutomationCloseButtonSelector = `[data-automation="ss-callout__close"]`;

    const alertQueriesMock: AlertQueries = mock(AlertQueries);
    const systemHelperMock: SystemHelper = mock(SystemHelper);

    const announcements = ANNOUNCEMENTS_LIST_MOCK.items;
    const firstAnnouncement = announcements[0];
    const initialState: Pick<State, 'alertSlice'> = {
        alertSlice: {
            alerts: [],
            announcements,
            readAnnouncements: [
                '591fffce-d4ba-4cd9-a150-ae71e23715df',
            ],
        },
    };
    const clickEvent: Event = new Event('click');

    const getElement = (element: string): Element => el.querySelector(element);
    const getNativeElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslateModule.forRoot(),
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        declarations: [
            AnnouncementListComponent,
            CalloutComponent,
        ],
        providers: [
            {
                provide: AlertQueries,
                useValue: instance(alertQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
            {
                provide: SystemHelper,
                useValue: instance(systemHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AnnouncementListComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        store = TestBed.inject(Store);

        when(alertQueriesMock.observeLastUnreadAnnouncement()).thenReturn(of(firstAnnouncement));
        when(systemHelperMock.isDeprecatedBrowser()).thenReturn(false);

        fixture.detectChanges();
    });

    it('should render only first announcement', () => {
        const expectedAnnouncement = firstAnnouncement;

        component.ngOnInit();

        expect(component.announcement).toEqual(expectedAnnouncement);
        expect(getElement(announcementSelector)).not.toBeNull();
    });

    it('should render deprecated browser warning', () => {
        when(systemHelperMock.isDeprecatedBrowser()).thenReturn(true);
        when(alertQueriesMock.observeLastUnreadAnnouncement()).thenReturn(of(undefined));

        component.ngOnInit();

        expect(component.isDeprecatedBrowser).toBeTruthy();
        expect(getElement(deprecatedBrowserSelector)).not.toBeNull();
    });

    it('should render announcement and ignore deprecated browser warning', () => {
        const expectedAnnouncement = firstAnnouncement;

        when(systemHelperMock.isDeprecatedBrowser()).thenReturn(true);

        component.ngOnInit();

        expect(component.isDeprecatedBrowser).toBeTruthy();
        expect(component.announcement).toEqual(expectedAnnouncement);
        expect(getElement(announcementSelector)).not.toBeNull();
        expect(getElement(deprecatedBrowserSelector)).toBeNull();
    });

    it('should NOT render deprecated browser warning', () => {
        when(systemHelperMock.isDeprecatedBrowser()).thenReturn(false);
        when(alertQueriesMock.observeLastUnreadAnnouncement()).thenReturn(of(undefined));

        component.ngOnInit();

        expect(component.isDeprecatedBrowser).toBeFalsy();
        expect(getElement(deprecatedBrowserSelector)).toBeNull();
        expect(getElement(announcementSelector)).toBeNull();
    });

    it('should trigger AlertActions.Request.ReadAnnouncements when component starts', () => {
        const expectedResult = new AlertActions.Request.ReadAnnouncements();

        spyOn(store, 'dispatch');

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should populate announcement with last unread announcement when component starts', () => {
        expect(component.announcement).toEqual(firstAnnouncement);
    });

    it('should trigger handleCloseAnnouncement with correct announcement when close button is clicked', () => {
        const expectedReadAnnouncement = firstAnnouncement;

        spyOn(component, 'handleCloseAnnouncement');

        getNativeElement(dataAutomationCloseButtonSelector).dispatchEvent(clickEvent);

        expect(component.handleCloseAnnouncement).toHaveBeenCalledWith(expectedReadAnnouncement);
    });

    it('should trigger AlertActions.Set.AnnouncementHasRead with announcement id when handleCloseAnnouncement is called', () => {
        const expectedStoreAction = new AlertActions.Set.AnnouncementHasRead(firstAnnouncement.id);

        spyOn(store, 'dispatch');
        component.handleCloseAnnouncement(firstAnnouncement);

        expect(store.dispatch).toHaveBeenCalledWith(expectedStoreAction);
    });
});
