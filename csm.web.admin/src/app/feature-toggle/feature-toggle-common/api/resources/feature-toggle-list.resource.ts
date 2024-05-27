/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {FeatureToggleResource} from './feature-toggle.resource';

export class FeatureToggleListResource {
    public items: FeatureToggleResource[];
    public _links: FeatureToggleListResourceLinks;
}

export class FeatureToggleListResourceLinks {
    public self?: ResourceLink;
}
