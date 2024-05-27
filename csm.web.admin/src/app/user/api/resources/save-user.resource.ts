/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {PhoneNumber} from '../../../shared/misc/api/datatypes/phone-number.datatype';

export class SaveUserResource {
    public gender: string;
    public firstName: string;
    public lastName: string;
    public position?: string;
    public craftIds?: string[];
    public phoneNumbers?: PhoneNumber[];
    public eulaAccepted?: boolean;
}
