/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {LegalDocumentResource} from '../../../../user/api/resources/user-legal-documents.resource';
import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {USER_ROUTE_PATHS} from '../../../../user/user-routing/user-routing.routes';
import {AuthService} from '../../../authentication/services/auth.service';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {
    MenuItem,
    MenuItemsList
} from '../../../ui/menus/menu-list/menu-list.component';

export const EXTERNAL_LINKS: { label: string; href: string; dataAutomation: string }[] = [
    {
        label: 'Legal_PrivacyStatement_Label',
        href: 'Legal_PrivacyStatement_Link',
        dataAutomation: 'account-menu-option-privacy-statement',
    },
    {
        label: 'Legal_Imprint_Label',
        href: 'Legal_Imprint_Link',
        dataAutomation: 'account-menu-option-imprint',
    },
    {
        label: 'Legal_OSSLicenses_Label',
        href: '3rdpartylicenses.txt',
        dataAutomation: 'account-menu-option-oss',
    },
];
export const LOGOUT_ITEM_ID = 'logout';
export const USER_GUIDE_ITEM_ID = 'userGuide';

@Component({
    selector: 'ss-account-menu',
    templateUrl: './account-menu.component.html',
    styleUrls: ['./account-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenuComponent implements OnInit, OnDestroy {
    @ViewChild('externalLinkTemplate', {static: true})
    public externalLinkTemplate: TemplateRef<any>;

    @ViewChild('externalLinkWithIconTemplate', {static: true})
    public externalLinkWithIconTemplate: TemplateRef<any>;

    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    @ViewChild('internalLinkTemplate', {static: true})
    public internalLinkTemplate: TemplateRef<any>;

    public dropdownItems: MenuItemsList[] = [];

    public legalDocuments: LegalDocumentResource[] = [];

    public userId: string;

    public userPicture: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _authService: AuthService,
                private _breakpointHelper: BreakpointHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _legalDocumentsQueries: LegalDocumentsQueries,
                private _store: Store<State>,
                private _userQueries: UserQueries,
    ) {
    }

    ngOnInit() {
        this._requestCurrentUser();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleItemClicked({id}: MenuItem): void {
        switch (id) {
            case LOGOUT_ITEM_ID:
                this._handleLogout();
                break;
        }
    }

    private _handleLogout(): void {
        this._authService.logout();
    }

    private _setDropdownItems(userId: string): void {
        const legalLinks: { label: string; href: string; dataAutomation: string }[] = this.legalDocuments.map(document => ({
            label: document.displayName,
            href: document.url,
            dataAutomation: `account-menu-${(document.type)}`,
        }));

        this.dropdownItems = [
            {
                customFigureTemplate: this.internalLinkTemplate,
                separator: true,
                items: [{
                    id: 'Generic_MyProfileLabel',
                    type: 'button',
                    unsearchable: true,
                    customData: {
                        dataAutomation: 'account-menu-option-profile',
                        label: 'Generic_MyProfileLabel',
                        routerLink: [`/${USER_ROUTE_PATHS.users}/${userId}`],
                    },
                }],
            },
            {
                customFigureTemplate: this.externalLinkTemplate,
                separator: true,
                items: [...legalLinks, ...EXTERNAL_LINKS].map(({label, href, dataAutomation}) => ({
                    id: label,
                    type: 'button',
                    unsearchable: true,
                    customData: {
                        dataAutomation,
                        label,
                        href,
                    },
                })),
            },
            {
                customFigureTemplate: this.iconTemplate,
                items: [{
                    id: LOGOUT_ITEM_ID,
                    type: 'button',
                    label: 'Generic_Logout',
                    unsearchable: true,
                    customData: {
                        icon: 'logout',
                        dataAutomation: 'account-menu-option-logout',
                    },
                }],
            },
        ];

        if (this._breakpointHelper.currentBreakpoint() === 'xs') {
            const userGuideOption: MenuItemsList = {
                customFigureTemplate: this.externalLinkWithIconTemplate,
                items: [{
                    id: USER_GUIDE_ITEM_ID,
                    type: 'button',
                    unsearchable: true,
                    customData: {
                        dataAutomation: 'account-menu-user-guide',
                        href: 'Generic_UserGuide_Link',
                        icon: 'question-mark',
                        label: 'Generic_UserGuide',
                    },
                }],
            };

            this.dropdownItems.splice(this.dropdownItems.length - 1, 0, userGuideOption);
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe(user => {
                    this._setUserInfo(user);
                    this._setDropdownItems(user.id);

                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => {
                    this._setDropdownItems(this.userId);

                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._legalDocumentsQueries
                .observeLegalDocumentsList()
                .pipe(filter(documents => !!documents?.length))
                .subscribe(documents =>{
                    this.legalDocuments = documents;

                    this._setDropdownItems(this.userId);

                    this._changeDetectorRef.detectChanges();
                })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setUserInfo({id, _embedded}: UserResource): void {
        this.userId = id;
        this.userPicture = _embedded.profilePicture._links.small.href;
    }

    private _requestCurrentUser(): void {
        this._store.dispatch(new UserActions.Request.Current());
    }
}
