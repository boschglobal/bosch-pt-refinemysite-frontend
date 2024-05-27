/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NewsArticle} from "../models/news-article.model";

export const NEWS_ARTICLES: NewsArticle[] = [
    {
        id: '1',
        title: 'WhatsNew_NonWorkingDays_Title',
        date: new Date('2023-07-13T01:00:00'),
        textContent: 'WhatsNew_NonWorkingDays_Content',
        image: {
            path: 'assets/images/whats-new/non-working-days.png',
            alt: 'non-working-days',
        },
    },
    {
        id: '2',
        title: 'WhatsNew_TaskUpdateFlags_Title',
        date: new Date('2023-08-23T01:00:00'),
        textContent: 'WhatsNew_TaskUpdateFlags_Content',
        image: {
            path: 'assets/images/whats-new/task-update-flags.png',
            alt: 'screenshot containing the task update flags feature',
        },
    },
    {
        id: '3',
        title: 'WhatsNew_CommandBarConsistency_Title',
        date: new Date('2023-08-23T02:00:00'),
        textContent: 'WhatsNew_CommandBarConsistency_Content',
        image: {
            path: 'assets/images/whats-new/command-bar-consistency.png',
            alt: 'screenshot containing the command bar consistency',
        },
    },
    {
        id: '4',
        title: 'WhatsNew_DifferentWorkareaMultipleTasksSelect_Title',
        date: new Date('2023-09-20T01:00:00'),
        textContent: 'WhatsNew_DifferentWorkareaMultipleTasksSelect_Content',
        image: {
            path: 'assets/images/whats-new/multiple-tasks-select-different-workarea.png',
            alt: 'screenshot containing the different workarea multiple tasks select',
        },
    },
    {
        id: '5',
        title: 'WhatsNew_MultipleTasksStatusChange_Title',
        date: new Date('2023-09-21T02:00:00'),
        textContent: 'WhatsNew_MultipleTasksStatusChange_Content',
        image: {
            path: 'assets/images/whats-new/multiple-task-status-change.png',
            alt: 'screenshot containing the multiple tasks status change and delete',
        },
    },
    {
        id: '6',
        title: 'WhatsNew_CopyTaskWithDayCards_Title',
        date: new Date('2023-10-30T02:00:00'),
        textContent: 'WhatsNew_CopyTaskWithDayCards_Content',
        image: {
            path: 'assets/images/whats-new/copy-tasks-with-daycards.png',
            alt: 'screenshot containing the copy tasks with daycards',
        },
    },
    {
        id: '7',
        title: 'WhatsNew_MoveCopyTaskWithCommandBar_Title',
        date: new Date('2023-10-31T02:00:00'),
        textContent: 'WhatsNew_MoveCopyTaskWithCommandBar_Content',
        image: {
            path: 'assets/images/whats-new/move-copy-tasks-command-bar.png',
            alt: 'screenshot containing the move/copy tasks with command bar',
        },
    },
];
