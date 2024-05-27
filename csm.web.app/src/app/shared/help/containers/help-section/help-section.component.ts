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
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    NavigationEnd,
    Router
} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {difference} from 'lodash';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {UserQueries} from '../../../../user/store/user/user.queries';
import {LocalStorageService} from '../../../local-storage/api/local-storage.service';
import {NEWS_ARTICLES} from '../../constants/news-articles.constant';
import {NewsArticle} from '../../models/news-article.model';

@Component({
    selector: 'ss-help-section',
    templateUrl: './help-section.component.html',
    styleUrls: ['./help-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpSectionComponent implements OnInit, OnDestroy {
    public hasUnreadArticles = false;

    public isPanelOpen = false;

    public whatsNewArticles: NewsArticle[] = NEWS_ARTICLES;

    public readonly showMoreMaxLength = 500;

    private _disposableSubscriptions: Subscription = new Subscription();

    @HostListener('document:click', ['$event'])
    private _clickOut(event) {
        if (this.isPanelOpen && !this._elementRef.nativeElement.contains(event.target)) {
            this._closePanel();
        }
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _elementRef: ElementRef,
                private _localStorageService: LocalStorageService,
                private _router: Router,
                private _translateService: TranslateService,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._sortNewsArticles();
        this._hasUnreadArticles();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public contactSupport(): string {
        const currentUserInformation = this._userQueries.getCurrentState();

        const mailTo = encodeURIComponent(this._translateService.instant('Generic_SupportEmail'));
        const subject = encodeURIComponent(this._translateService.instant('Generic_SupportEmail_Subject', {
            firstName: currentUserInformation.firstName,
            lastName: currentUserInformation.lastName,
            emailAddress: currentUserInformation.email,
        }));

        return `mailto:${mailTo}?Subject=${subject}`;
    }

    public trackByFn(index: number, item: NewsArticle): string {
        return item.id;
    }

    public togglePanel(): void {
        this.isPanelOpen = !this.isPanelOpen;

        if (this.isPanelOpen) {
            this._setWhatsNewArticlesRead();
        }
    }

    private _getCurrentWhatsNewArticlesIds(): string[] {
        return this.whatsNewArticles.map(article => article.id);
    }

    private _hasUnreadArticles(): void {
        const whatsNewArticlesIds = this._getCurrentWhatsNewArticlesIds();
        const readArticlesIds = this._localStorageService.findWhatsNewReadArticles();

        this.hasUnreadArticles = !!difference(whatsNewArticlesIds, readArticlesIds).length;
        this._changeDetectorRef.detectChanges();
    }

    private _setWhatsNewArticlesRead(): void {
        const whatsNewArticlesIds = this._getCurrentWhatsNewArticlesIds();

        this._localStorageService.updateWhatsNewReadArticles(whatsNewArticlesIds);
        this._hasUnreadArticles();
    }

    private _sortNewsArticles(): void {
        this.whatsNewArticles.sort((a, b) => a.date > b.date ? -1 : 1);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd))
                .subscribe(() => this._closePanel())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _closePanel(): void {
        this.isPanelOpen = false;
    }
}
