/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ParticipantRoleEnumHelper} from '../../../../project-common/enums/participant-role.enum';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';

export const PARTICIPANT_ROLE_GROUP_ID = 'participant-role-group-id';
export const DELETE_PARTICIPANT_ITEM_ID = 'delete-participant';
export const RESEND_PARTICIPANT_INVITATION_ITEM_ID = 'resend-participant-invitation';

export class ProjectParticipantsListRowModel {
    constructor(public company: ResourceReference,
                public user: ResourceReferenceWithPicture,
                public role: string,
                public status: ParticipantStatusEnum,
                public craft: string,
                public telephone: string,
                public email: string,
                public id: string,
                public options: MenuItemsList[],
                public hasLink: boolean = false) {
        this.hasLink = ProjectParticipantsListRowModel.setHasLink(this.status);
    }

    public static fromResource(projectParticipantResource: ProjectParticipantResource): ProjectParticipantsListRowModel {
        return new ProjectParticipantsListRowModel(
            this._setCompany(projectParticipantResource),
            this._setUser(projectParticipantResource),
            ParticipantRoleEnumHelper.getLabelByKey(projectParticipantResource.projectRole),
            projectParticipantResource.status,
            this.setFirstCraft(projectParticipantResource.crafts),
            this.setFirstTelephone(projectParticipantResource.phoneNumbers),
            projectParticipantResource.email,
            projectParticipantResource.id,
            this.setActions(projectParticipantResource),
            this.setHasLink(projectParticipantResource.status)
        );
    }

    public static setFirstCraft(crafts: ResourceReference[]): string {
        return crafts?.[0]?.displayName || null;
    }

    public static setFirstTelephone(telephones: PhoneNumber[]): string {
        return telephones?.length ? `${telephones[0].countryCode} ${telephones[0].phoneNumber}` : null;
    }

    public static setHasLink(status: ParticipantStatusEnum): boolean {
        return status === ParticipantStatusEnum.ACTIVE;
    }

    public static setActions(projectParticipantResource: ProjectParticipantResource): MenuItemsList[] {
        const dropdownItems: MenuItemsList<ProjectParticipantResource>[] = [];

        if (projectParticipantResource._links.hasOwnProperty('update')) {
            const items: MenuItem<ProjectParticipantResource>[] = ParticipantRoleEnumHelper
                .getValues()
                .map(role => {
                    const isCurrentRole = role === projectParticipantResource.projectRole;

                    return {
                        id: role,
                        value: projectParticipantResource,
                        label: ParticipantRoleEnumHelper.getLabelByValue(role),
                        type: 'select-icon',
                        groupId: PARTICIPANT_ROLE_GROUP_ID,
                        selected: isCurrentRole,
                        disabled: isCurrentRole,
                    };
                });
            dropdownItems.push({items, separator: true});
        }
        if (projectParticipantResource._links.hasOwnProperty('resend')) {
            const items: MenuItem<ProjectParticipantResource>[] = [{
                id: RESEND_PARTICIPANT_INVITATION_ITEM_ID,
                value: projectParticipantResource,
                label: 'Participant_Resend_Invitation',
                type: 'button',
            }];

            dropdownItems.push({items, separator: true, reserveIndicatorSpace: true});
        }

        if (projectParticipantResource._links.hasOwnProperty('delete')) {
            const items: MenuItem<ProjectParticipantResource>[] = [{
                id: DELETE_PARTICIPANT_ITEM_ID,
                value: projectParticipantResource,
                label: 'Participant_Delete_Role',
                type: 'button',
            }];

            dropdownItems.push({items, separator: true, reserveIndicatorSpace: true});
        }

        return dropdownItems;
    }

    private static _setCompany(participant: ProjectParticipantResource): ResourceReference {
        switch (participant.status) {
            case ParticipantStatusEnum.VALIDATION:
            case ParticipantStatusEnum.INVITED:
                return new ResourceReference(null, '-');
            default:
                return participant.company;
        }
    }

    private static _setUser(participant: ProjectParticipantResource): ResourceReferenceWithPicture {
        switch (participant.status) {
            case ParticipantStatusEnum.VALIDATION:
            case ParticipantStatusEnum.INVITED:
                return new ResourceReferenceWithPicture(participant.id, null, null);
            default:
                return participant.user;
        }
    }
}
