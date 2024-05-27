/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';
import {ObjectIdentifierPair} from './object-identifier-pair.datatype';

describe('Object Identifier Pair', () => {

    const objectIdentifierA = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
    const objectIdentifierB = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'bar');
    const objectIdentifierC = new ObjectIdentifierPair(ObjectTypeEnum.Topic, 'bar');
    const expectedIdentifierA = `${ObjectTypeEnum.Task}.foo`;

    it('should verify that is the same object', () => {
        expect(objectIdentifierA.isSame(objectIdentifierA)).toBeTruthy();
    });

    it('should verify that is not the same object', () => {
        expect(objectIdentifierA.isSame(objectIdentifierB)).toBeFalsy();
    });

    it('should verify that is the same object type', () => {
        expect(objectIdentifierA.isSameType(objectIdentifierA)).toBeTruthy();
    });

    it('should verify that is not the same object type', () => {
        expect(objectIdentifierA.isSameType(objectIdentifierC)).toBeFalsy();
    });

    it('should verify that has the same object id', () => {
        expect(objectIdentifierA.isSameId(objectIdentifierA)).toBeTruthy();
    });

    it('should verify that has not the same object id', () => {
        expect(objectIdentifierA.isSameId(objectIdentifierB)).toBeFalsy();
    });

    it('should return the right string identifier', () => {
        const identifier = objectIdentifierA.stringify();
        expect(identifier).toEqual(expectedIdentifierA);
    });
});
