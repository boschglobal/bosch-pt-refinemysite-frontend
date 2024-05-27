/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    ContentChild,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
} from '@angular/core';

export const CSS_DRAWER_OPEN_CLASS = 'ss-drawer--open';

@Component({
    selector: 'ss-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent implements OnInit, OnDestroy {

    @ContentChild('header')
    public header: TemplateRef<any>;

    @ContentChild('body')
    public body: TemplateRef<any>;

    @ContentChild('footer')
    public footer: TemplateRef<any>;

    constructor(private _renderer: Renderer2) {
    }

    ngOnInit(): void {
        this._renderer.addClass(document.body, CSS_DRAWER_OPEN_CLASS);
    }

    ngOnDestroy(): void {
        this._renderer.removeClass(document.body, CSS_DRAWER_OPEN_CLASS);
    }
}
