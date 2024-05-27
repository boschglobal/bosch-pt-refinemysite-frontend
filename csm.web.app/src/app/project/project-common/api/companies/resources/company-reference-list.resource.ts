/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractPagedListResource} from '../../../../../shared/misc/api/resources/abstract-paged-list.resource';

export class CompanyReferenceListResource extends AbstractPagedListResource {
    public companies: ResourceReference[];
}
