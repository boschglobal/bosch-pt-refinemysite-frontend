/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

interface Image {
    path?: string;
    alt?: string;
}

export interface NewsArticle {
    id: string;
    date: Date;
    title: string;
    textContent: string;
    image?: Image;
}
