/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {BlobService} from '../../../rest/services/blob.service';
import {TranslationModule} from '../../../translation/translation.module';
import {BackgroundImageDirective} from '../../../ui/directives/background-image.directive';
import {IconModule} from '../../../ui/icons/icon.module';
import {ButtonLinkComponent} from '../../../ui/links/button-link/button-link.component';
import {GenericBannerComponent} from './generic-banner.component';

describe('Generic Banner Component', () => {
    let fixture: ComponentFixture<GenericBannerComponent>;
    let comp: GenericBannerComponent;
    let de: DebugElement;

    const dataAutomationTitleSelector = '[data-automation="generic-banner-title"]';
    const dataAutomationSubtitleSelector = '[data-automation="generic-banner-subtitle"]';
    const dataAutomationDescriptionSelector = '[data-automation="generic-banner-description"]';
    const testDataIsPictureBorder = true;
    const testDataTitle = 'Foo';
    const testDataSubtitle = 'Bar';
    const testDataDescription = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, se            y.';

    const getElement = (selector: string) => de.query(By.css(selector)).nativeElement;
    const getElementTextContent = (selector: string) => getElement(selector).textContent;

    const moduleDef: TestModuleMetadata = {
        imports: [
            RouterTestingModule,
            TranslationModule.forRoot(),
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
        ],
        declarations: [
            BackgroundImageDirective,
            ButtonLinkComponent,
            GenericBannerComponent,
        ],
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        providers: [
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
            {
                provide: Router,
                useValue: RouterStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericBannerComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should render title', () => {
        comp.title = testDataTitle;
        fixture.detectChanges();
        expect(getElementTextContent(dataAutomationTitleSelector)).toContain(testDataTitle);
    });

    it('should render subtitle', () => {
        comp.subtitle = testDataSubtitle;
        fixture.detectChanges();
        expect(getElementTextContent(dataAutomationSubtitleSelector)).toContain(testDataSubtitle);
    });

    it('should render description', () => {
        comp.description = testDataDescription;
        fixture.detectChanges();

        expect(getElement(dataAutomationDescriptionSelector)).toBeTruthy();
    });

    it('should render picture border', () => {
        comp.isPictureBorder = testDataIsPictureBorder;
        fixture.detectChanges();
        const pictureWithBorder = de.query(By.css('.ss-generic-banner__picture-border'));
        expect(pictureWithBorder).toBeTruthy();
    });
});
