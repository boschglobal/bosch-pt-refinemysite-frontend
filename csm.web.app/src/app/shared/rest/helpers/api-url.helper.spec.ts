/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../configurations/configuration';
import {ApiUrlHelper} from './api-url.helper';

describe('Api Url Helper', () => {
    let api: string;

    beforeAll(() => {
        api = configuration.api;
    });

    afterEach(() => {
        configuration.api = api;
    });

    it('should return TRUE when isApiUrl is called and a api url is passed as parameter', () => {
        const apiUrlHelper = new ApiUrlHelper();
        const url = `${configuration.api}/v3/projects`;

        expect(apiUrlHelper.isApiUrl(url)).toBeTruthy();
    });

    it('should return FALSE when isApiUrl is called and a non api url is passed as parameter', () => {
        const apiUrlHelper = new ApiUrlHelper();
        const url = `https://${location.host}/assets/`;

        expect(apiUrlHelper.isApiUrl(url)).toBeFalsy();
    });

    it('should generate versioned api url for localhost', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const expectedApiUrl = `https://dev-api.bosch-refinemysite.com/internal/${microserviceVersion}`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = 'https://dev-api.bosch-refinemysite.com/internal';
        apiUrlHelper.host = 'localhost';

        expect(apiUrlHelper.getVersionedApiUrl()).toBe(expectedApiUrl);
    });

    it('should generate versioned api url for Azure https://sandbox1.bosch-refinemysite.com', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const expectedApiUrl = `https://sandbox1-api.bosch-refinemysite.com/internal/${microserviceVersion}`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = null;
        apiUrlHelper.host = 'sandbox1.bosch-refinemysite.com';

        expect(apiUrlHelper.getVersionedApiUrl()).toBe(expectedApiUrl);
    });

    it('should generate versioned api url for Azure https://app.bosch-refinemysite.com', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const expectedApiUrl = `https://api.bosch-refinemysite.com/internal/${microserviceVersion}`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = null;
        apiUrlHelper.host = 'app.bosch-refinemysite.com';

        expect(apiUrlHelper.getVersionedApiUrl()).toBe(expectedApiUrl);
    });

    it('should generate api url without version for localhost', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const expectedApiUrl = `https://dev-api.bosch-refinemysite.com/internal`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = 'https://dev-api.bosch-refinemysite.com/internal';
        apiUrlHelper.host = 'localhost';

        expect(apiUrlHelper.getApiUrl()).toBe(expectedApiUrl);
    });

    it('should generate api url without version for Azure https://sandbox1.bosch-refinemysite.com', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const expectedApiUrl = `https://sandbox1-api.bosch-refinemysite.com/internal`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = null;
        apiUrlHelper.host = 'sandbox1.bosch-refinemysite.com';

        expect(apiUrlHelper.getApiUrl()).toBe(expectedApiUrl);
    });

    it('should generate ApiUrlBuilder pre-configured for a specific version of a microservice', () => {
        const microserviceVersion = ApiVersionsEnum.Project;
        const path = 'foo/bar';
        const expectedApiUrl = `https://sandbox1-api.bosch-refinemysite.com/internal/${microserviceVersion}/${path}`;
        const apiUrlHelper = new ApiUrlHelper(microserviceVersion);
        configuration.api = null;
        apiUrlHelper.host = 'sandbox1.bosch-refinemysite.com';

        expect(apiUrlHelper.withPath(path).build()).toBe(expectedApiUrl);
    });

    it('should return api authentication url for localhost', () => {
        const expectedApiAuthUrl = `https://dev-api.bosch-refinemysite.com`;
        const apiUrlHelper = new ApiUrlHelper();
        configuration.apiAuth = 'https://dev-api.bosch-refinemysite.com';

        expect(apiUrlHelper.getAuthenticationUrl()).toBe(expectedApiAuthUrl);
    });

    it('should return api authentication url for Azure https://dev.bosch-refinemysite.com', () => {
        const expectedApiAuthUrl = `https://dev-api.bosch-refinemysite.com`;
        const apiUrlHelper = new ApiUrlHelper();
        configuration.apiAuth = null;
        apiUrlHelper.host = 'dev.bosch-refinemysite.com';

        expect(apiUrlHelper.getAuthenticationUrl()).toBe(expectedApiAuthUrl);
    });
});
