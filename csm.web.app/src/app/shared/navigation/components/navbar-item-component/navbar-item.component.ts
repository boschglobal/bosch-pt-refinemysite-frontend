/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {NavBarItem} from '../navbar-component/navbar.component';

@Component({
    selector: 'ss-navbar-item',
    templateUrl: './navbar-item.component.html',
    styleUrls: ['./navbar-item.component.scss'],
})

export class NavbarItemComponent implements OnDestroy {
    /**
     * @description index of the navBarItem
     */
    @Input()
    public iterator: number;

    /**
     * @description Sets navBarItem information
     */
    @Input()
    public set item(navBarItem: NavBarItem) {
        this._navBarItem = navBarItem;
        this._setLabel();
    }

    /**
     * @description Retrieves navBarItem information
     */
    public get item(): NavBarItem {
        return this._navBarItem;
    }

    /**
     * @description NavBarItem label
     */
    public label = '';

    private _disposableSubscriptions = new Subscription();

    private _navBarItem: NavBarItem;

    constructor(private _translateService: TranslateService) {
    }

    ngOnDestroy(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setLabel(): void {
        const {dynamicLabel, staticLabel} = this._navBarItem;

        this._disposableSubscriptions.add(
            (dynamicLabel || this._translateService.get(staticLabel))
                .subscribe(label => this.label = label)
        );
    }
}
