/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {FeatureResource} from './feature.resource';

export class FeatureListResource {
    public items: FeatureResource[];
    public _links: FeatureListResourceLinks;
}

export class FeatureListResourceLinks {
    public self?: ResourceLink;
}
