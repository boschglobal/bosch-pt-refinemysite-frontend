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

import {StickyMirrorComponent} from './sticky-mirror.component';

describe('Sticky Mirror Component', () => {
    let fixture: ComponentFixture<StickyMirrorComponent>;
    let comp: StickyMirrorComponent;

    const moduleDef: TestModuleMetadata = {
        declarations: [StickyMirrorComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StickyMirrorComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });
});
