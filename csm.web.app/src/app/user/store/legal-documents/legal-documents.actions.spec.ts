/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    LegalDocumentsActions,
    LegalDocumentsEnum
} from './legal-documents.actions';

describe('Legal Documents Actions', () => {
    it('should check Request.All() type', () => {
        expect(new LegalDocumentsActions.Request.All().type).toBe(LegalDocumentsEnum.RequestAll);
    });

    it('should check Request.AllFulfilled() type', () => {
        expect(new LegalDocumentsActions.Request.AllFulfilled(null).type).
        toBe(LegalDocumentsEnum.RequestAllFulfilled);
    });

    it('should check Request.AllRejected() type', () => {
        expect(new LegalDocumentsActions.Request.AllRejected().type).toBe(LegalDocumentsEnum.RequestAllRejected);
    });

    it('should check Request.UnregisteredAll() type', () => {
        expect(new LegalDocumentsActions.Request.UnregisteredAll(null, null).type).
        toBe(LegalDocumentsEnum.RequestAllUnregistered);
    });

    it('should check Request.UnregisteredAllFulfilled() type', () => {
        expect(new LegalDocumentsActions.Request.UnregisteredAllFulfilled(null).type).
        toBe(LegalDocumentsEnum.RequestAllUnregisteredFulfilled);
    });

    it('should check Request.UnregisteredAllRejected() type', () => {
        expect(new LegalDocumentsActions.Request.UnregisteredAllRejected().type).
        toBe(LegalDocumentsEnum.RequestAllUnregisteredRejected);
    });

    it('should check Consent.All() type', () => {
        expect(new LegalDocumentsActions.Consent.All(null).type).toBe(LegalDocumentsEnum.ConsentAll);
    });

    it('should check Consent.AllFulfilled() type', () => {
        expect(new LegalDocumentsActions.Consent.AllFulfilled().type).toBe(LegalDocumentsEnum.ConsentAllFulfilled);
    });

    it('should check Consent.AllRejected() type', () => {
        expect(new LegalDocumentsActions.Consent.AllRejected().type).toBe(LegalDocumentsEnum.ConsentAllRejected);
    });

    it('should check Consent.Delay() type', () => {
        expect(new LegalDocumentsActions.Consent.Delay().type).toBe(LegalDocumentsEnum.DelayConsent);
    });

    it('should check Consent.DelayFulfilled() type', () => {
        expect(new LegalDocumentsActions.Consent.DelayFulfilled().type).toBe(LegalDocumentsEnum.DelayConsentFulfilled);
    });

    it('should check Consent.DelayRejected() type', () => {
        expect(new LegalDocumentsActions.Consent.DelayRejected().type).toBe(LegalDocumentsEnum.DelayConsentRejected);
    });
});
