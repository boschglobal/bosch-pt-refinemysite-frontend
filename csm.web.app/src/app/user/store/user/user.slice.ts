/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractItemWithPicture} from '../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {UserResource} from '../../api/resources/user.resource';

export class UserSlice {
    currentItem: AbstractItemWithPicture;
    items: UserResource[];
    privacySettings: UserPrivacySettings;
}
