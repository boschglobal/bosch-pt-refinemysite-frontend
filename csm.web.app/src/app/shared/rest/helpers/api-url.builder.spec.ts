/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ApiUrlBuilder} from './api-url.builder';

describe('Url Builder Helper', () => {
    const basePath = 'https://localhost/api/v1';
    const path = 'foo/bar';
    const field = 'name';
    const direction = 'asc';
    const pageIndex = 0;
    const pageSize = 100;
    const limit = 50;
    const itemId = 'b0d5690e-0e53-4e13-8910-1d2938bedc191';
    const paramKey = 'baz';
    const paramValue = true;
    const date = 'Fri Mar 20 2020 14:50:00 GMT+0000';

    it('should build url with path', () => {
        const expectedUrl = `${basePath}/${path}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with sort', () => {
        const expectedUrl = `${basePath}/${path}?sort=${field},${direction}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withSort(field, direction)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with pagination', () => {
        const expectedUrl = `${basePath}/${path}?page=${pageIndex}&size=${pageSize}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withPagination(pageSize, pageIndex)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with cursor pagination for items before a given identifier', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}&before=${itemId}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationBefore(limit, itemId)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should encode "before" query param value', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}&before=${encodeURIComponent(date)}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationBefore(limit, date)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with cursor pagination when no before reference is provided', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationBefore(limit, null)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with cursor pagination for items after a given identifier', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}&after=${itemId}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationAfter(limit, itemId)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should encode "after" query param value', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}&after=${encodeURIComponent(date)}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationAfter(limit, date)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with cursor pagination when no after reference is provided', () => {
        const expectedUrl = `${basePath}/${path}?limit=${limit}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withCursorPaginationAfter(limit, null)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with custom query parameter', () => {
        const expectedUrl = `${basePath}/${path}?${paramKey}=${paramValue}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withQueryParam(paramKey, paramValue)
            .build();

        expect(url).toBe(expectedUrl);
    });

    it('should build url with combination of parameters', () => {
        const expectedUrl = `${basePath}/${path}?${paramKey}=${paramValue}&page=${pageIndex}&size=${pageSize}&sort=${field},${direction}`;
        const url = ApiUrlBuilder
            .withBasePath(basePath)
            .withPath('foo/bar')
            .withQueryParam(paramKey, paramValue)
            .withPagination(pageSize, pageIndex)
            .withSort(field, direction)
            .build();

        expect(url).toBe(expectedUrl);
    });
});
