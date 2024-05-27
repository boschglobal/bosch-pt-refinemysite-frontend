/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {
    MissingTranslationHandler,
    MissingTranslationHandlerParams
} from '@ngx-translate/core';

/*
 * Smart Site specific implementation of the MissingTranslationHandler
 */
export class SmartSiteMissingTranslationHandler implements MissingTranslationHandler {

    public handle(param: MissingTranslationHandlerParams) {
        return 'Translation missing for key ' + param.key;
    }
}
