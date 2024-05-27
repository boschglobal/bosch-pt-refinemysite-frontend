/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {WizardLineColor} from './wizard-step/wizard-step.component';
import {WizardStepsComponent} from './wizard-steps.component';

describe('Wizard Steps Component', () => {
    let component: WizardStepsComponent;
    let fixture: ComponentFixture<WizardStepsComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            WizardStepsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardStepsComponent);
        component = fixture.componentInstance;

        component.wizardSteps = [
            {
                label: 'Test 1',
                icon: 'edit',
                active: false,
                disabled: false,
            },
            {
                label: 'Test 2',
                active: true,
                disabled: false,
            },
            {
                icon: 'edit',
                active: false,
                disabled: false,
            },
            {
                label: 'Test 4',
                icon: 'edit',
                active: false,
                disabled: true,
            }];

        fixture.detectChanges();
    });

    describe(('#advanceStep'), () => {
        it('should advance to next step if not last and emit WizardSteps', () => {
            const currentStepIndex = 1;
            const expectedStep = 2;

            spyOn(component.wizardStepsChange, 'emit').and.callThrough();

            component.advanceStep();

            expect(component.wizardSteps[currentStepIndex].active).toBeFalsy();
            expect(component.wizardSteps[expectedStep].active).toBeTruthy();
            expect(component.currentStepIndex).toEqual(expectedStep);
            expect(component.wizardStepsChange.emit).toHaveBeenCalledWith(component.wizardSteps);
        });

        it('should not advance to next step if last step', () => {
            component.currentStepIndex = 1;
            const currentStepIndex = 1;

            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: true,
                    disabled: false,
                },
            ];

            component.advanceStep();

            expect(component.wizardSteps[currentStepIndex].active).toBeTruthy();
            expect(component.currentStepIndex).toEqual(currentStepIndex);
        });

        it('should not advance to next step if next step is disabled', () => {
            component.currentStepIndex = 0;
            const currentStepIndex = 0;

            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: true,
                },
            ];

            component.advanceStep();

            expect(component.wizardSteps[currentStepIndex].active).toBeTruthy();
            expect(component.wizardSteps[currentStepIndex + 1].active).toBeFalsy();
            expect(component.currentStepIndex).toEqual(currentStepIndex);
        });
    });

    describe(('#regressStep'), () => {
        it('should regress to previous step if not first and emit WizardSteps', () => {
            const currentStepIndex = 1;
            const expectedStep = 0;

            spyOn(component.wizardStepsChange, 'emit').and.callThrough();

            component.currentStepIndex = currentStepIndex;
            component.regressStep();

            expect(component.wizardSteps[currentStepIndex].active).toBeFalsy();
            expect(component.wizardSteps[expectedStep].active).toBeTruthy();
            expect(component.currentStepIndex).toEqual(expectedStep);
            expect(component.wizardStepsChange.emit).toHaveBeenCalledWith(component.wizardSteps);
        });

        it('should not regress to previous step if first step', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: false,
                },
            ];

            component.currentStepIndex = 0;
            const currentStepIndex = 0;

            component.regressStep();

            expect(component.wizardSteps[currentStepIndex].active).toBeTruthy();
            expect(component.currentStepIndex).toEqual(currentStepIndex);
        });
    });

    describe(('#handleNavigation'), () => {
        it('should set navigated step as active and set status as Available in previous step and emit WizardSteps', () => {
            const previousCurrentStepIndex = 1;
            const expectedCurrentStepIndex = 2;
            const expectedSteps = [
                {
                    label: 'Test 1',
                    icon: 'edit',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: false,
                },
                {
                    icon: 'edit',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 4',
                    icon: 'edit',
                    active: false,
                    disabled: true,
                },
            ];

            spyOn(component.wizardStepsChange, 'emit').and.callThrough();

            component.handleNavigation(expectedCurrentStepIndex);

            expect(component.wizardSteps[expectedCurrentStepIndex].active).toBeTruthy();
            expect(component.wizardSteps[previousCurrentStepIndex].active).toBeFalsy();

            expect(component.currentStepIndex).toEqual(expectedCurrentStepIndex);
            expect(component.wizardStepsChange.emit).toHaveBeenCalledWith(expectedSteps);
        });
    });

    describe(('#StepLineColors'), () => {
        it('should return null for left line for first step', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: false,
                },
            ];
            component.currentStepIndex = 0;
            fixture.detectChanges();

            expect(component.getLeftLineColor(component.currentStepIndex)).toBe(null);
        });

        it('should return the class for blue line for left line if step is neither first nor disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: true,
                    disabled: false,
                },
            ];
            component.currentStepIndex = 1;
            fixture.detectChanges();

            expect(component.getLeftLineColor(component.currentStepIndex)).toBe(WizardLineColor.Blue);
        });

        it('should return blue line class for left line if step is available and not disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: false,
                },
            ];
            component.currentStepIndex = 0;
            fixture.detectChanges();

            expect(component.getLeftLineColor(component.currentStepIndex + 1)).toBe(WizardLineColor.Blue);
        });

        it('should return grey line class for left line if step is disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: true,
                },
            ];
            component.currentStepIndex = 0;
            fixture.detectChanges();

            expect(component.getLeftLineColor(component.currentStepIndex + 1)).toBe(WizardLineColor.Grey);
        });

        it('should return null for right line for last step', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: true,
                    disabled: false,
                },
            ];
            component.currentStepIndex = 1;
            fixture.detectChanges();

            expect(component.getRightLineColor(component.currentStepIndex)).toBe(null);
        });

        it('should return the class for blue line for right line if step is neither active nor disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: true,
                    disabled: false,
                },
            ];
            component.currentStepIndex = 1;
            fixture.detectChanges();

            expect(component.getRightLineColor(component.currentStepIndex - 1)).toBe(WizardLineColor.Blue);
        });

        it('should return the class for grey line for right line if the next step is disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: false,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 3',
                    active: false,
                    disabled: true,
                },
            ];
            component.currentStepIndex = 1;
            fixture.detectChanges();

            expect(component.getRightLineColor(component.currentStepIndex)).toBe(WizardLineColor.Grey);
        });

        it('should return the class for grey line for right line if step is disabled', () => {
            component.wizardSteps = [
                {
                    label: 'Test 1',
                    active: true,
                    disabled: false,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: true,
                },
                {
                    label: 'Test 2',
                    active: false,
                    disabled: true,
                },
            ];
            component.currentStepIndex = 0;
            fixture.detectChanges();

            expect(component.getRightLineColor(component.currentStepIndex + 1)).toBe(WizardLineColor.Grey);
        });
    });
});
