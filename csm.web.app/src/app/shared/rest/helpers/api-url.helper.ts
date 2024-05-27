/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../configurations/configuration';
import {ApiUrlBuilder} from './api-url.builder';

export class ApiUrlHelper {

    public host = location.host;

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

    public isApiUrl(url: string): boolean {
        return url.includes(this.getApiUrl()) || url.includes(this.getAuthenticationUrl());
    }

    private _getRestApiUrlFromLocation(): string {
        const [, subdomain, domain] = this.host.match(this._hostNameRegExp);
        const apiSubdomain = subdomain === 'app' ? 'api' : `${subdomain}-api`;

        return `https://${apiSubdomain}.${domain}`;
    }
}
