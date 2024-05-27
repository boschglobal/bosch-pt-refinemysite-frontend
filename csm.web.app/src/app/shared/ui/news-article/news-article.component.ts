/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {NewsArticleFormatEnum} from '../../../project/project-common/enums/date-format.enum';

const SUPPORTED_ARTICLE_LANGUAGES = [
    'de',
    'en',
];

@Component({
    selector: 'ss-news-article',
    templateUrl: './news-article.component.html',
    styleUrls: ['./news-article.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsArticleComponent {

    @Input()
    public articleId: string;

    @Input()
    public articleTitle: string;

    @Input()
    public set articleDate(date: Date) {
        this._setNewsArticleDate(date);
    }

    public newsArticleFormattedDate: string;

    constructor(private _translateService: TranslateService) {}

    private _setNewsArticleDate(date: Date) {
        const language = this._translateService.defaultLang;
        const supportedArticleLanguage = SUPPORTED_ARTICLE_LANGUAGES.includes(language) ? language : 'en';

        this.newsArticleFormattedDate = moment(date)
            .locale(supportedArticleLanguage)
            .format(NewsArticleFormatEnum[supportedArticleLanguage]);
    }
}
