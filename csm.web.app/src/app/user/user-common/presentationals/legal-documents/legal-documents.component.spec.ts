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
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
    MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2,
} from '../../../../../test/mocks/user-legal-documents';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {LegalDocumentsComponent} from './legal-documents.component';

describe('Legal Documents Component', () => {
    let fixture: ComponentFixture<LegalDocumentsComponent>;
    let comp: LegalDocumentsComponent;
    let de: DebugElement;

    const acceptButtonSelector = `[data-automation="legal-documents-accept-button"]`;
    const delayButtonSelector = `[data-automation="legal-documents-delay-button"]`;
    const clickEvent: Event = new Event('click');

    const termsAndConditionsDocument = MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1;
    const eulaDocument = MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2;
    const legalDocuments = [
        termsAndConditionsDocument,
        eulaDocument,
    ];

    const getNativeElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            LegalDocumentsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LegalDocumentsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.legalDocuments = legalDocuments;
        comp.ngOnChanges({legalDocuments: null});
        fixture.detectChanges();
    });

    it('should create the form with 2 checkboxes when there are 2 documents to consent', () => {
        expect(comp.form.get(termsAndConditionsDocument.type)).toBeTruthy();
        expect(comp.form.get(eulaDocument.type)).toBeTruthy();
    });

    it('should create the form with 1 checkbox when there are only 1 document to consent', () => {
        comp.legalDocuments = [termsAndConditionsDocument];
        comp.ngOnChanges({legalDocuments: null});

        expect(comp.form.get(termsAndConditionsDocument.type)).toBeTruthy();
        expect(comp.form.get(eulaDocument.type)).toBeFalsy();
    });

    it('should emit accept when Accept button is clicked', () => {
        const legalDocumentIds = legalDocuments.map(({id}) => id);

        spyOn(comp.accept, 'emit');

        comp.form.get(termsAndConditionsDocument.type).setValue(true);
        comp.form.get(eulaDocument.type).setValue(true);

        getNativeElement(acceptButtonSelector).dispatchEvent(clickEvent);

        expect(comp.accept.emit).toHaveBeenCalledWith(legalDocumentIds);
    });

    it('should emit delay when Delay button is clicked', () => {
        spyOn(comp.delay, 'emit');

        getNativeElement(delayButtonSelector).dispatchEvent(clickEvent);

        expect(comp.delay.emit).toHaveBeenCalled();
    });
});
