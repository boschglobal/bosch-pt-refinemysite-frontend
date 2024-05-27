/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';
import {ObjectIdentifierPairWithVersion} from './object-identifier-pair-with-version.datatype';

describe('Object List Identifier With Version', () => {
    const version = 1;
    const dummyIdentifier1 = '85ca6fc0-8e44-4344-9002-b249b1bc7dd5';
    const dummyIdentifier2 = 'bb4389c6-0895-4ee3-a234-af47658c6a12';
    const expectedIdentifierA = `${ObjectTypeEnum.Task}.${dummyIdentifier1}.v1`;

    const objectIdentifierA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, dummyIdentifier1, version);
    const objectIdentifierB = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, dummyIdentifier1, version);
    const objectIdentifierC = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Topic, dummyIdentifier2, version);

    it('should return the right string identififier for a Task with version', () => {
        const identifier = objectIdentifierA.stringify();
        expect(identifier).toEqual(expectedIdentifierA);
    });

    it('should verify that is the same object', () => {
        expect(objectIdentifierA.isSame(objectIdentifierB)).toBeTruthy();
    });

    it('should verify that is not the same object', () => {
        expect(objectIdentifierA.isSame(objectIdentifierC)).toBeFalsy();
    });

    it('should verify that is the same object type', () => {
        expect(objectIdentifierA.isSameType(objectIdentifierB)).toBeTruthy();
    });

    it('should verify that is not the same object type', () => {
        expect(objectIdentifierA.isSameType(objectIdentifierC)).toBeFalsy();
    });

    it('should verify that has the same object id', () => {
        expect(objectIdentifierA.isSameId(objectIdentifierB)).toBeTruthy();
    });

    it('should verify that both have the same version', () => {
        expect(objectIdentifierA.hasSameVersion(objectIdentifierB)).toBeTruthy();
    });

    it('should verify that has not the same object id', () => {
        expect(objectIdentifierA.isSameId(objectIdentifierC)).toBeFalsy();
    });
});
