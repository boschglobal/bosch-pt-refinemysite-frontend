/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';

export class FeatureResource extends AbstractAuditableResource {
    public name: string;
    public state: FeatureStateEnum;
    public whitelist: WhitelistedSubject[];
}

export class WhitelistedSubject {
    public subjectRef: string;
    public type: ObjectTypeEnum;
}

export enum FeatureStateEnum {
    DISABLED = 'Disabled',
    ENABLED = 'Enabled',
    WHITELISTACTIVATED = 'Whitelist Activated',
}
