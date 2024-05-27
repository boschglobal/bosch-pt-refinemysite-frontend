/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {StickyElement} from './resources/sticky-element.datatype';
import {
    STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES,
    StickyService
} from './sticky.service';

describe('Sticky Service', () => {
    let stickyService: StickyService;

    const stickyTestElement = document.createElement('sticky-test-element');
    const stickyTestMirrorElement = document.createElement('sticky-test-mirror-element');

    document.createElement('sticky-test-root-element').appendChild(stickyTestElement);

    const stickyElement = new StickyElement(
        'sticky-test',
        stickyTestElement,
        stickyTestMirrorElement,
        0,
        0,
    );

    const moduleDef: TestModuleMetadata = {
        providers: [StickyService],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        stickyService = TestBed.inject(StickyService);

        stickyService.register(stickyElement);
    });

    it('should be created', () => {
        expect(stickyService).toBeTruthy();
    });

    it('should trigger sticky element update for specific CSS classes that are added to document body', (done) => {
        const cssClass = STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES[0];

        spyOn(stickyElement, 'updateSticky').and.callFake(() => null);

        document.body.classList.add(cssClass);

        setTimeout(() => {
            expect(stickyElement.updateSticky).toHaveBeenCalled();
            document.body.classList.remove(cssClass);
            done();
        }, 1);
    });

    it('should trigger sticky element update for specific CSS classes that are removed from document body', (done) => {
        const cssClass = STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES[0];

        document.body.classList.remove('ss-modal--open');

        document.body.classList.add(cssClass);

        spyOn(stickyElement, 'updateSticky').and.callFake(() => null);

        document.body.classList.remove(cssClass);

        setTimeout(() => {
            expect(stickyElement.updateSticky).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should not trigger sticky element update for unspecified CSS classes that are added or removed from document body', (done) => {
        const cssClass = 'sticky-not-allowed-class';

        spyOn(stickyElement, 'updateSticky').and.callFake(() => null);

        document.body.classList.add(cssClass);
        document.body.classList.remove(cssClass);

        setTimeout(() => {
            expect(stickyElement.updateSticky).not.toHaveBeenCalled();
            done();
        }, 1);
    });
});

