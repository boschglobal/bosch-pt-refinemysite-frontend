/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {EventTypeEnum} from '../../enums/event-type.enum';

export class RealtimeEventUpdateDataResource {
    constructor(public event: EventTypeEnum,
                public root: ObjectIdentifierPair,
                public object: ObjectIdentifierPairWithVersion) {

    }

    public static fromString(data: string): RealtimeEventUpdateDataResource {
        const {event, root, object} = JSON.parse(data);
        return new RealtimeEventUpdateDataResource(
            event,
            new ObjectIdentifierPair(root.type, root.id || root.identifier),
            new ObjectIdentifierPairWithVersion(object.type, object.id || object.identifier, object.version),
        );
    }
}
