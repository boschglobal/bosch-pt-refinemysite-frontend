/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PhoneNumber} from '../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {TaskStatusEnum} from '../enums/task-status.enum';

export class ProjectTaskCardAssigneeModel {
    taskId: string;
    projectId: string;
    assigned: boolean;
    assignee: ResourceReferenceWithPicture;
    company: ResourceReference;
    email?: string;
    phone?: string;
    status: TaskStatusEnum;
    participantId: string;
    canBeAssigned: boolean;
    canBeSent: boolean;

    constructor(taskId: string,
                projectId: string,
                assigned: boolean,
                assignee: ResourceReferenceWithPicture,
                company: ResourceReference,
                status: TaskStatusEnum,
                canBeAssigned: boolean,
                canBeSent: boolean,
                participantId?: string,
                email?: string,
                phone?: PhoneNumber[]
    ) {
        this.taskId = taskId;
        this.projectId = projectId;
        this.assigned = assigned;
        this.assignee = assignee;
        this.company = company;
        this.status = status;
        this.email = email;
        this.phone = this._getPhoneNumber(phone);
        this.participantId = participantId;
        this.canBeAssigned = canBeAssigned;
        this.canBeSent = canBeSent;
    }

    private _getPhoneNumber(phoneNumbers: PhoneNumber[]): string {
        let mobileNumber: string;

        if (phoneNumbers && phoneNumbers.length > 0) {
            let parsedNumber: PhoneNumber = phoneNumbers.find((phoneNumber: PhoneNumber) => phoneNumber.phoneNumberType === 'MOBILE');

            if (typeof parsedNumber === 'undefined') {
                parsedNumber = phoneNumbers[0];
            }
            mobileNumber = `${parsedNumber.countryCode} ${parsedNumber.phoneNumber}`;
        }

        return mobileNumber;
    }
}
