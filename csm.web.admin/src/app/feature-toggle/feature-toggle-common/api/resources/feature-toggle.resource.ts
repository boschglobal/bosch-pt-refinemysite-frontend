/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';

export class FeatureToggleResource extends AbstractAuditableResource {
    public featureId: string;
    public subjectId: string;
    public type: ObjectTypeEnum;
    public name: string;
    public displayName: string;
    public whitelisted: boolean;
}
