/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {FeatureToggleEnumKey} from '../../../../../configurations/feature-toggles/feature-toggle.enum';
import {FeatureToggleHelper} from '../../../misc/helpers/feature-toggle.helper';
import {IfFeatureActiveDirective} from './if-feature-active.directive';
import {IfFeatureActiveTestComponent} from './if-feature-active.test.component';

describe('If Feature Active Directive', () => {
    let fixture: ComponentFixture<IfFeatureActiveTestComponent>;
    let comp: IfFeatureActiveTestComponent;

    const featureToggleKeyA: FeatureToggleEnumKey = 'AAA' as FeatureToggleEnumKey;
    const featureToggleKeyB: FeatureToggleEnumKey = 'BBB' as FeatureToggleEnumKey;

    const featureToggleHelperMock: FeatureToggleHelper = mock(FeatureToggleHelper);
    const getElement = (): HTMLElement => fixture.debugElement.query(By.css('[data-automation="feature-toggle"]'))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            IfFeatureActiveDirective,
            IfFeatureActiveTestComponent,
        ],
        providers: [
            {
                provide: FeatureToggleHelper,
                useValue: instance(featureToggleHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(IfFeatureActiveTestComponent);
        comp = fixture.componentInstance;
    });

    it('should show the element when one of the provided features is active', () => {
        let calls = 0;
        when(featureToggleHelperMock.isFeatureActive(undefined)).thenCall(() => calls++ === 0);

        comp.features = [featureToggleKeyA, featureToggleKeyB];
        fixture.detectChanges();

        expect(getElement()).toBeTruthy();
    });

    it('should show the element when all the provided features are active', () => {
        when(featureToggleHelperMock.isFeatureActive(undefined)).thenReturn(true);

        comp.features = [featureToggleKeyA, featureToggleKeyB];
        fixture.detectChanges();

        expect(getElement()).toBeTruthy();
    });

    it('should hide the element when the provided feature is not active', () => {
        when(featureToggleHelperMock.isFeatureActive(undefined)).thenReturn(true);

        comp.features = [featureToggleKeyA];
        fixture.detectChanges();

        expect(getElement()).toBeTruthy();

        when(featureToggleHelperMock.isFeatureActive(undefined)).thenReturn(false);
        comp.features = [featureToggleKeyB];
        fixture.detectChanges();

        expect(getElement()).toBeFalsy();
    });
});
