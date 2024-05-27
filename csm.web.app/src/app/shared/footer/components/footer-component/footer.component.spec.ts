/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2
} from '../../../../../test/mocks/user-legal-documents';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';
import {LegalDocumentTypeEnum} from '../../../../user/user-common/enums/legal-document-type.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {CopyrightComponent} from '../../../ui/copyright/copyright.component';
import {FooterComponent} from './footer.component';

describe('Footer Component', () => {
    let fixture: ComponentFixture<FooterComponent>;
    let comp: FooterComponent;
    let de: DebugElement;

    const footerTermsLinkSelector = `[data-automation="footer-${LegalDocumentTypeEnum.TermsAndConditions}"]`;
    const footerEULALinkSelector = `[data-automation="footer-${LegalDocumentTypeEnum.Eula}"]`;
    const footerImprintLinkSelector = '[data-automation="footer-imprint-link"]';
    const footerPrivacyStatementLinkSelector = '[data-automation="footer-privacy-statement-link"]';
    const footerOssLicensesLinkSelector = '[data-automation="footer-oss-licenses-link"]';
    const footerCopyrightLabelSelector = '[data-automation="footer-copyright-label"]';
    const legalDocumentsQueriesMock: LegalDocumentsQueries = mock(LegalDocumentsQueries);
    const legalDocumentsMock = [
        MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
        MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2,
    ];

    const getElement = (selector: string) => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: LegalDocumentsQueries,
                useValue: instance(legalDocumentsQueriesMock),
            },
        ],
        declarations: [
            CopyrightComponent,
            FooterComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        when(legalDocumentsQueriesMock.observeLegalDocumentsList()).thenReturn(of(legalDocumentsMock));

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });

    it('should render Terms link with right href and label', () => {
        const {displayName, url} = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1;
        const link: HTMLElement = getElement(footerTermsLinkSelector);

        expect(link.textContent).toBe(displayName);
        expect(link.getAttribute('href')).toBe(url);
    });

    it('should render EULA link with right href and label', () => {
        const {displayName, url} = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2;
        const link: HTMLElement = getElement(footerEULALinkSelector);

        expect(link.textContent).toBe(displayName);
        expect(link.getAttribute('href')).toBe(url);
    });

    it('should render Imprint link with right href and label', () => {
        const link: HTMLElement = getElement(footerImprintLinkSelector);

        expect(link.textContent).toBe('Legal_Imprint_Label');
        expect(link.getAttribute('href')).toBe('Legal_Imprint_Link');
    });

    it('should render Privacy Statement link with right href and label', () => {
        const link: HTMLElement = getElement(footerPrivacyStatementLinkSelector);

        expect(link.textContent).toBe('Legal_PrivacyStatement_Label');
        expect(link.getAttribute('href')).toBe('Legal_PrivacyStatement_Link');
    });

    it('should render OSS link with right href and label', () => {
        const link: HTMLElement = getElement(footerOssLicensesLinkSelector);

        expect(link.textContent).toBe('Legal_OSSLicenses_Label');
        expect(link.getAttribute('href')).toBe('3rdpartylicenses.txt');
    });

    it('should render Copyright label', () => {
        const label: HTMLElement = getElement(footerCopyrightLabelSelector);

        expect(label).not.toBeNull();
    });
});
