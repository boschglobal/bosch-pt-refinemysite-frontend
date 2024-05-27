/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    ERROR_ALERT_MOCK,
    SUCCESS_ALERT_MOCK
} from '../../../../../test/mocks/alerts';
import {MockStore} from '../../../../../test/mocks/store';
import {State} from '../../../../app.reducers';
import {TranslationModule} from '../../../translation/translation.module';
import {AlertResource} from '../../api/resources/alert.resource';
import {AlertComponent} from '../../presentationals/alert/alert.component';
import {AlertActions} from '../../store/alert.actions';
import {AlertQueries} from '../../store/alert.queries';
import {AlertListComponent} from './alert-list.component';

describe('Alert List Component', () => {
    let fixture: ComponentFixture<AlertListComponent>;
    let comp: AlertListComponent;
    let de: DebugElement;
    let store: Store<State>;

    const alertQueriesMock: AlertQueries = mock(AlertQueries);
    const alerts: AlertResource[] = [ERROR_ALERT_MOCK, SUCCESS_ALERT_MOCK];

    const dataAutomationAlertSelector = `[data-automation="ss-alert-list__alert"]`;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            AlertComponent,
            AlertListComponent,
        ],
        providers: [
            {
                provide: AlertQueries,
                useFactory: () => instance(alertQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        store = TestBed.inject(Store);

        when(alertQueriesMock.observeAlerts()).thenReturn(of(alerts));
        comp.ngOnInit();

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });

    it('should render one alert element for each alert', () => {
        const alertElements = de.queryAll(By.css(dataAutomationAlertSelector));

        expect(alertElements.length).toBe(alerts.length);
    });

    it('should dispatch AlertActions.Remove.Alert() action when handleClose is called for a given alert', () => {
        const alertId = ERROR_ALERT_MOCK.id;
        const expectedResult = new AlertActions.Remove.Alert(alertId);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleClose(alertId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
