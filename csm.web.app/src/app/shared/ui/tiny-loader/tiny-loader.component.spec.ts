/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {TinyLoaderComponent} from './tiny-loader.component';

describe('TinyLoaderComponent', () => {
    let component: TinyLoaderComponent;
    let fixture: ComponentFixture<TinyLoaderComponent>;

    const moduleDef: TestModuleMetadata = {
        declarations: [TinyLoaderComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TinyLoaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create Tiny Loader Component', () => {
        expect(component).toBeTruthy();
    });

    it('should have no mode classes by default', () => {
        expect(component.mode).toBeUndefined();
        expect(component.modeClasses).toBeUndefined();
    });

    it('should have "ss-tiny-loader--normal" classes when mode is "undefined"', () => {
        component.mode = undefined;
        expect(component.modeClasses).toEqual({
            ['ss-tiny-loader--normal']: true
        });
    });

    it('should have "ss-tiny-loader--inverted" classes when mode is "inverted"', () => {
        component.mode = 'inverted';
        expect(component.modeClasses).toEqual({
            ['ss-tiny-loader--inverted']: true
        });
    });

    it('should have "ss-tiny-loader--normal" classes when mode is "normal"', () => {
        component.mode = 'normal';
        expect(component.modeClasses).toEqual({
            ['ss-tiny-loader--normal']: true
        });
    });
});
