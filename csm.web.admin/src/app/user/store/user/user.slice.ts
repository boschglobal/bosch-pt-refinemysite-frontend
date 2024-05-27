/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractItem} from 'src/app/shared/misc/store/datatypes/abstract-item.datatype';
import {ResourceReferenceWithEmail} from '../../../shared/misc/api/datatypes/resource-reference-with-email.datatype';
import {UserResource} from '../../api/resources/user.resource';

export class UserSlice {
    currentItem: AbstractItem;
    authenticatedUser: AbstractItem;
    items: UserResource[];
    suggestions: ResourceReferenceWithEmail[];
}
