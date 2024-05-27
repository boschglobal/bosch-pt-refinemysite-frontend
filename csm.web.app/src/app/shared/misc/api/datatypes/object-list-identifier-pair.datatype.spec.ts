/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';
import {ObjectListIdentifierPair} from './object-list-identifier-pair.datatype';

describe('Object List Identifier Pair', () => {
    const dummyIdentifier1 = '85ca6fc0-8e44-4344-9002-b249b1bc7dd5';
    const dummyIdentifier2 = 'bb4389c6-0895-4ee3-a234-af47658c6a12';
    const expectedIdentifierA = `${ObjectTypeEnum.Task}.${dummyIdentifier1}.INCLUDE_CHILDREN`;
    const expectedIdentifierC = `${ObjectTypeEnum.Topic}.${dummyIdentifier2}`;

    const objectListIdentifierA = new ObjectListIdentifierPair(ObjectTypeEnum.Task, dummyIdentifier1, true);
    const objectListIdentifierB = new ObjectListIdentifierPair(ObjectTypeEnum.Task, dummyIdentifier1, true);
    const objectListIdentifierC = new ObjectListIdentifierPair(ObjectTypeEnum.Topic, dummyIdentifier2, false);

    it('should return the right string identififier for a Task with children', () => {
        const identifier = objectListIdentifierA.stringify();
        expect(identifier).toEqual(expectedIdentifierA);
    });

    it('should return the right string identififier for a Topic without children', () => {
        const identifier = objectListIdentifierC.stringify();
        expect(identifier).toEqual(expectedIdentifierC);
    });

    it('should verify that is the same object', () => {
        expect(objectListIdentifierA.isSame(objectListIdentifierB)).toBeTruthy();
    });

    it('should verify that is not the same object', () => {
        expect(objectListIdentifierA.isSame(objectListIdentifierC)).toBeFalsy();
    });

    it('should verify that is the same object type', () => {
        expect(objectListIdentifierA.isSameType(objectListIdentifierB)).toBeTruthy();
    });

    it('should verify that is not the same object type', () => {
        expect(objectListIdentifierA.isSameType(objectListIdentifierC)).toBeFalsy();
    });

    it('should verify that has the same object id', () => {
        expect(objectListIdentifierA.isSameId(objectListIdentifierA)).toBeTruthy();
    });

    it('should verify that both include children', () => {
        expect(objectListIdentifierA.bothIncludeChildren(objectListIdentifierB)).toBeTruthy();
    });

    it('should verify that has not the same object id', () => {
        expect(objectListIdentifierA.isSameId(objectListIdentifierC)).toBeFalsy();
    });
});
