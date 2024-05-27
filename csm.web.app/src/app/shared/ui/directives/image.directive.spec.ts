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
import {By} from '@angular/platform-browser';

import {BlobServiceMock} from '../../../../test/mocks/blob.service.mock';
import {BlobService} from '../../rest/services/blob.service';
import {ImageDirective} from './image.directive';
import {ImageTestComponent} from './image.test.component';

describe('Image Directive', () => {
    let fixture: ComponentFixture<ImageTestComponent>;
    let comp: ImageTestComponent;
    let de: DebugElement;

    const getElement = () => {
        return de.query(By.css('[data-automation="image-test"]')).nativeElement;
    };

    const moduleDef: TestModuleMetadata = {
        declarations: [
            ImageDirective,
            ImageTestComponent
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceMock
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageTestComponent);
        fixture.detectChanges();
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should set image src on host component', () => {
        expect(getElement().src).toBeTruthy();
    });
});
