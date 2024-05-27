/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

@Component({
    selector: 'ss-news-article-test',
    templateUrl: './news-article.test.component.html',
    styles: [
        ':host {display: block; width: 360px}',
        'img {height: 184px; width: 326px}',
    ],
})
export class NewsArticleTestComponent {
    public articleId: string;

    public articleDate: Date;

    public articleTitle: string;

    public newsArticleTextContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ut nunc nibh.
    Mauris nulla elit, sodales dapibus justo eget, fermentum feugiat sapien. Praesent malesuada, nisi placerat facilisis lacinia,
    lectus metus condimentum dui, ut ultricies ante nisi ac mi. Quisque ullamcorper facilisis nulla, nec iaculis sapien rutrum tristique.
    In vulputate mattis diam. Proin mollis et nunc sit amet pulvinar. Suspendisse a tincidunt metus. Nulla finibus euismod ex quis
    interdum. Proin sollicitudin bibendum nunc eu placerat. Sed laoreet ipsum turpis, sit amet euismod lectus viverra eget. Mauris
    dignissim magna vitae sem ultricies, in ornare ligula rhoncus. Aliquam erat volutpat.`;
}
