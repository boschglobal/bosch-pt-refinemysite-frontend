/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {ApiUrlBuilder} from './api-url.builder';
import {configuration} from '../../../../configurations/configuration';

export class ApiUrlHelper {

    private _host = location.host;

    private _hostNameRegExp = new RegExp('([^.]*).(.*)');

    constructor(private _apiVersion: ApiVersionsEnum | string = 'v1') {
    }

    public withPath(path: string): ApiUrlBuilder {
        return ApiUrlBuilder
            .withBasePath(this.getVersionedApiUrl())
            .withPath(path);
    }

    public getVersionedApiUrl(): string {
        return `${this.getApiUrl()}/${this._apiVersion}`;
    }

    public getApiUrl(): string {
        return configuration.api || `${this._getRestApiUrlFromLocation()}/internal`;
    }

    public getAuthenticationUrl(): string {
        return configuration.apiAuth || this._getRestApiUrlFromLocation();
    }

    private _getRestApiUrlFromLocation(): string {
        const [, subdomain, domain] = this._host.match(this._hostNameRegExp);
        const parsedSubdomain = subdomain.replace('-admin', '');
        const apiSubdomain = parsedSubdomain === 'app' ? 'api' : `${parsedSubdomain}-api`;

        return `https://${apiSubdomain}.${domain}`;
    }
}
