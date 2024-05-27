/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';

export enum RealtimeActionEnum {
    SetContext = '[Realtime] Set context',
    UnsetContext = '[Realtime] Unset context',
}

export namespace RealtimeActions {
    export namespace Set {
        export class Context implements Action {
            readonly type = RealtimeActionEnum.SetContext;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }
    }

    export namespace Unset {
        export class Context implements Action {
            readonly type = RealtimeActionEnum.UnsetContext;
        }
    }
}

export type RealtimeActions =
    RealtimeActions.Set.Context |
    RealtimeActions.Unset.Context;
