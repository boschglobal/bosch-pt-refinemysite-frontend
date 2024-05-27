/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLinkTemplated} from '../../../../../shared/misc/api/datatypes/resource-link-templated.datatype';
import {MetricsResource} from './metrics.resource';

export class MetricsListResource {
    public items: MetricsResource[];
    public _links?: MetricsListResourceLinks;
}

export class MetricsListResourceLinks {
    public self: ResourceLinkTemplated;
}
