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

import {LoaderComponent} from './loader.component';

describe('Loader Component', () => {
    let fixture: ComponentFixture<LoaderComponent>;
    let comp: LoaderComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const loaderSelector = '.ss-loader';

    const moduleDef: TestModuleMetadata = {
        declarations: [LoaderComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoaderComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should show the loader if isLoading is true', () => {
        comp.isLoading = true;
        fixture.detectChanges();

        expect(el.querySelector(loaderSelector)).not.toBe(null);
    });

    it('should not show the loader if isLoading is false', () => {
        comp.isLoading = false;
        fixture.detectChanges();

        expect(el.querySelector(loaderSelector)).toBe(null);
    });
});
