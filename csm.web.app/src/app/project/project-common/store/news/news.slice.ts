/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NewsResource} from '../../api/news/resources/news.resource';

export interface NewsSlice {
    items: NewsResource[];
}
