/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    convertToParamMap,
    ParamMap,
    UrlSegment
} from '@angular/router';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class ActivatedRouteStub {
    private subject = new BehaviorSubject(convertToParamMap(this.testParamMap));
    paramMap = this.subject.asObservable();

    private _testParamMap: ParamMap;
    get testParamMap() {
        return this._testParamMap;
    }

    set testParamMap(params: {}) {
        this._testParamMap = convertToParamMap(params);
        this.subject.next(this._testParamMap);
    }

    get snapshot() {
        return {
            paramMap: this.testParamMap,
            data: this.data,
            url: this.url
        };
    }

    private _children: ActivatedRouteStub[] = [];
    set children(children: any[]) {
        this._children = children;
    }

    get children() {
        return this._children;
    }

    private _outlet = 'primary';
    set outlet(outlet: string) {
        this._outlet = outlet;
    }

    get outlet() {
        return this._outlet;
    }

    private _data: Object = {};
    set data(data: any) {
        this._data = data;
    }

    get data() {
        return this._data;
    }

    private _pathFromRoot: ActivatedRouteStub[] = [];
    set pathFromRoot(pathFromRoot: ActivatedRouteStub[]) {
        this._pathFromRoot = pathFromRoot;
    }

    get pathFromRoot() {
        return this._pathFromRoot;
    }

    private _url: UrlSegment[] = [];
    set url(url: UrlSegment[]) {
        this._url = url;
    }

    get url() {
        return this._url;
    }
}
