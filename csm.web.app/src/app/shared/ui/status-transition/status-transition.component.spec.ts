/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {
    BrowserAnimationsModule,
    NoopAnimationsModule
} from '@angular/platform-browser/animations';

import {TranslationModule} from '../../translation/translation.module';
import {UIModule} from '../ui.module';
import {
    StatusTransitionComponent,
    TransitionStatusEnum
} from './status-transition.component';

describe('Status Transition Component', () => {
    let fixture: ComponentFixture<StatusTransitionComponent>;
    let comp: StatusTransitionComponent;
    let de: DebugElement;

    const statusLoaderSelector = '[data-automation="status-loader"]';
    const statusCompletedSelector = '[data-automation="status-completed"]';
    const statusErrorSelector = '[data-automation="status-error"]';
    const statusDescriptionSelector = '[data-automation="status-description"]';
    const statusTitleSelector = '[data-automation="status-title"]';
    const cancelBtnSelector = '[data-automation="cancel-btn"]';

    const moduleDef: TestModuleMetadata = {
        declarations: [StatusTransitionComponent],
        imports: [
            NoopAnimationsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
    };

    const getElement = (selector: string) => de.query(By.css(selector));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StatusTransitionComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.title = 'foo';
        comp.description = 'bar';
    });

    it('should show the loader if status is isLoading', () => {
        comp.status = TransitionStatusEnum.InProgress;
        fixture.detectChanges();

        expect(getElement(statusLoaderSelector)).not.toEqual(null);
    });

    it('should show the check icon if status is completed', () => {
        comp.status = TransitionStatusEnum.Completed;
        fixture.detectChanges();

        expect(getElement(statusCompletedSelector)).not.toEqual(null);
    });

    it('should show the error icon if status is error', () => {
        comp.status = TransitionStatusEnum.Error;
        fixture.detectChanges();

        expect(getElement(statusErrorSelector)).not.toEqual(null);
    });

    it('should show the title, description and hide the cancel button', () => {
        comp.status = TransitionStatusEnum.Error;
        fixture.detectChanges();

        expect(getElement(statusTitleSelector)).not.toEqual(null);
        expect(getElement(statusDescriptionSelector)).not.toEqual(null);
        expect(getElement(cancelBtnSelector)).toEqual(null);
    });

    it('should show the cancel button if showCancelButton is true', () => {
        comp.status = TransitionStatusEnum.Error;
        comp.showCancelButton = true;
        fixture.detectChanges();

        expect(getElement(cancelBtnSelector)).not.toEqual(null);
    });

    it('should emit an event when handleCancel is called', () => {
        spyOn(comp.cancel, 'emit');

        comp.handleCancel();
        expect(comp.cancel.emit).toHaveBeenCalled();
    });
});
