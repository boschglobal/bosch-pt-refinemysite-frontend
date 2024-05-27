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
import {By} from '@angular/platform-browser';

import {MonitoringHelper} from '../helpers/monitoring.helper';
import {MonitoringModule} from '../monitoring.module';
import {MonitorClickActionDirective} from './monitor-click-action.directive';
import {MonitorClickActionTestComponent} from './monitor-click-action.test.component';

describe('Monitor Click Action Directive', () => {
    let fixture: ComponentFixture<MonitorClickActionTestComponent>;
    let comp: MonitorClickActionTestComponent;
    let de: DebugElement;
    let monitoringHelper: MonitoringHelper;

    const actionName = 'foo';
    const actionContext = {
        foo: 1,
    };

    const actionButtonSelector = '[data-automation="action-button"]';

    const getElement = selector => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        imports: [
            MonitoringModule,
            MonitorClickActionDirective,
        ],
        declarations: [
            MonitorClickActionTestComponent,
        ],
        providers: [
            {
                provide: MonitoringHelper,
                useValue: jasmine.createSpyObj('MonitoringHelper', ['addUserAction']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MonitorClickActionTestComponent);
        fixture.detectChanges();
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        monitoringHelper = TestBed.inject(MonitoringHelper);

        comp.actionName = actionName;
        comp.actionContext = actionContext;

        fixture.detectChanges();
    });

    it('should send user action when button it\'s clicked', () => {
        getElement(actionButtonSelector).triggerEventHandler('click');

        expect(monitoringHelper.addUserAction).toHaveBeenCalledWith(actionName, actionContext);
    });
});
