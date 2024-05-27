/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractResource} from './abstract.resource';

class TestResource extends AbstractResource {
    public content: string;
}

describe('Abstract Resource', () => {

    it('should return true when isEqual is called for two resources with the same id and version', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '1',
            version: 1,
            content: 'b',
        };

        expect(AbstractResource.isEqual(resourceA, resourceB)).toBeTruthy();
    });

    it('should return true when isEqual is called for two resources with the same id and no version', () => {
        const resourceA: TestResource = {
            id: '1',
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '1',
            content: 'b',
        };

        expect(AbstractResource.isEqual(resourceA, resourceB)).toBeTruthy();
    });

    it('should return false when isEqual is called for two resources with the same id but different versions', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '1',
            version: 2,
            content: 'b',
        };

        expect(AbstractResource.isEqual(resourceA, resourceB)).toBeFalsy();
    });

    it('should return false when isEqual is called for two resources with the same version but different ids', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 1,
            content: 'b',
        };

        expect(AbstractResource.isEqual(resourceA, resourceB)).toBeFalsy();
    });

    it('should return false when isEqual is called for two resources with different ids and versions', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 2,
            content: 'b',
        };

        expect(AbstractResource.isEqual(resourceA, resourceB)).toBeFalsy();
    });

    it('should return true when isEqualArray is called for two empty arrays of resources', () => {
        const resourceArrayA: TestResource[] = [];
        const resourceArrayB: TestResource[] = [];

        expect(AbstractResource.isEqualArray(resourceArrayA, resourceArrayB)).toBeTruthy();
    });

    it('should return true when isEqualArray is called for two arrays of resources with equal resources, in the same order', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 2,
            content: 'b',
        };
        const resourceArrayA: TestResource[] = [
            resourceA,
            resourceB,
        ];
        const resourceArrayB: TestResource[] = [
            resourceA,
            resourceB,
        ];

        expect(AbstractResource.isEqualArray(resourceArrayA, resourceArrayB)).toBeTruthy();
    });

    it('should return true when isEqualArray is called for two arrays of resources with equal resources, in different order', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 2,
            content: 'b',
        };
        const resourceArrayA: TestResource[] = [
            resourceA,
            resourceB,
        ];
        const resourceArrayB: TestResource[] = [
            resourceB,
            resourceA,
        ];

        expect(AbstractResource.isEqualArray(resourceArrayA, resourceArrayB)).toBeTruthy();
    });

    it('should return false when isEqualArray is called for two arrays of resources with different sizes', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 2,
            content: 'b',
        };
        const resourceArrayA: TestResource[] = [
            resourceA,
            resourceB,
        ];
        const resourceArrayB: TestResource[] = [
            resourceB,
        ];

        expect(AbstractResource.isEqualArray(resourceArrayA, resourceArrayB)).toBeFalsy();
    });

    it('should return false when isEqualArray is called for two arrays of resources with the same size, but different resources', () => {
        const resourceA: TestResource = {
            id: '1',
            version: 1,
            content: 'a',
        };
        const resourceB: TestResource = {
            id: '2',
            version: 2,
            content: 'b',
        };
        const resourceArrayA: TestResource[] = [
            resourceA,
        ];
        const resourceArrayB: TestResource[] = [
            resourceB,
        ];

        expect(AbstractResource.isEqualArray(resourceArrayA, resourceArrayB)).toBeFalsy();
    });
});
