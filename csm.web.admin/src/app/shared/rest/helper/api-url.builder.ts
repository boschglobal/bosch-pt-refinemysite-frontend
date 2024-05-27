/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class ApiUrlBuilder {

    private readonly _baseUrl: string;

    private _path: string;

    private _queryParams: Map<string, QueryParamValue> = new Map<string, QueryParamValue>();

    constructor(baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    static withBasePath(url: string): ApiUrlBuilder {
        return new ApiUrlBuilder(url);
    }

    public withPath(path: string): ApiUrlBuilder {
        this._path = path;

        return this;
    }

    public withPagination(pageSize: number, pageIndex: number): ApiUrlBuilder {
        this._queryParams.set('page', pageIndex);
        this._queryParams.set('size', pageSize);

        return this;
    }

    public withSort(field: string, direction: string): ApiUrlBuilder {
        this._queryParams.set('sort', `${field},${direction}`);

        return this;
    }

    public withQueryParam(name: string, value: QueryParamValue): ApiUrlBuilder {
        this._queryParams.set(name, value);

        return this;
    }

    public build(): string {
        const url = `${this._baseUrl}/${this._path}`;
        const queryString = Array.from(this._queryParams)
            .map(queryParam => queryParam.join('='))
            .join('&');

        return queryString ? `${url}?${queryString}` : url;
    }
}

type QueryParamValue = string | number | boolean;
