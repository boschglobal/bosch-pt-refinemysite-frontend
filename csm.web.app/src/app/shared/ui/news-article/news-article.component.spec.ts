/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {NewsArticleFormatEnum} from '../../../project/project-common/enums/date-format.enum';
import {UIModule} from '../ui.module';
import {NewsArticleComponent} from './news-article.component';
import {NewsArticleTestComponent} from './news-article.test.component';

describe('News Article Component', () => {
    let testHostComp: NewsArticleTestComponent;
    let fixture: ComponentFixture<NewsArticleTestComponent>;
    let de: DebugElement;
    let translateService: TranslateService;

    const newsArticleSelector = 'ss-news-article';

    const newsArticleDateSelector = '[data-automation="ss-news-article-date"]';
    const newsArticleTitleSelector = '[data-automation="ss-news-article-title"]';

    const newsArticleDate = new Date(862408616000);
    const newsArticleTitle = 'Title';

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            NewsArticleComponent,
            NewsArticleTestComponent,
        ],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslateModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsArticleTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(newsArticleSelector));
        translateService = TestBed.inject(TranslateService);

        testHostComp.articleDate = newsArticleDate;
        testHostComp.articleId = '123';
        testHostComp.articleTitle = newsArticleTitle;

        fixture.detectChanges();
    });

    it('should render correct news article date when the user default language is supported', () => {
        const userLocale = 'en';

        translateService.setDefaultLang('en');

        expect(getElement(newsArticleDateSelector).innerText).toEqual(moment(newsArticleDate)
            .locale(userLocale)
            .format(NewsArticleFormatEnum[userLocale]));
    });

    it('should render correct news article date when the user default language is not supported', () => {
        const userLocale = 'en';

        translateService.setDefaultLang('pt');

        expect(getElement(newsArticleDateSelector).innerText).toEqual(moment(newsArticleDate)
            .locale(userLocale)
            .format(NewsArticleFormatEnum[userLocale]));
    });

    it('should render correct news article title', () => {
        expect(getElement(newsArticleTitleSelector).innerText).toEqual(newsArticleTitle);
    });

});
