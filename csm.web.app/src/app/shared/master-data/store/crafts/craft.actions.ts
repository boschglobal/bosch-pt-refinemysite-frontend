/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

export const REQUEST_CRAFTS = 'REQUEST_CRAFTS';
export const REQUEST_CRAFTS_FULFILLED = 'REQUEST_CRAFTS_FULFILLED';
export const REQUEST_CRAFTS_REJECTED = 'REQUEST_CRAFTS_REJECTED';

export namespace CraftActions {
    export namespace Request {
        export class Crafts implements Action {
            type = REQUEST_CRAFTS;

            constructor(public payload = true) {
            }
        }

        export class CraftsFulfilled implements Action {
            type = REQUEST_CRAFTS_FULFILLED;

            constructor(public payload: any) {
            }
        }

        export class CraftsRejected implements Action {
            type = REQUEST_CRAFTS_REJECTED;

            constructor() {
            }
        }
    }
}
