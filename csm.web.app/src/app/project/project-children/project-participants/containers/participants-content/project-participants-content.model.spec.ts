/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {flatten} from 'lodash';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_3,
    MOCK_PARTICIPANT_4
} from '../../../../../../test/mocks/participants';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ParticipantRoleEnum} from '../../../../project-common/enums/participant-role.enum';
import {
    DELETE_PARTICIPANT_ITEM_ID,
    ProjectParticipantsListRowModel,
    RESEND_PARTICIPANT_INVITATION_ITEM_ID,
} from './project-participants-content.model';

describe('Project Participants List Row Model', () => {
    const selfParticipant = MOCK_PARTICIPANT;

    const deletableParticipant = {
        ...selfParticipant,
        _links: {
            ...selfParticipant._links,
            delete: {href: '1'},
        },
    };

    const resendableParticipant = {
        ...selfParticipant,
        _links: {
            ...selfParticipant._links,
            resend: {href: '1'},
        },
    };

    const editableParticipant = {
        ...selfParticipant,
        _links: {
            ...selfParticipant._links,
            update: {href: '1'},
        },
    };

    const editableDeletableParticipant = {
        ...selfParticipant,
        _links: {
            ...selfParticipant._links,
            delete: {href: '1'},
            update: {href: '1'},
        },
    };

    const projectParticipantsListRowModel = [
        selfParticipant,
        deletableParticipant,
        editableParticipant,
        editableDeletableParticipant,
        resendableParticipant,
    ].map(participant => ProjectParticipantsListRowModel.fromResource(participant));

    const getDropdownItem = (participant: ProjectParticipantsListRowModel, itemId: string): MenuItem<ProjectParticipantResource> =>
        flatten(participant.options.map(({items}) => items)).find(item => item.id === itemId);

    it('should parse a project participants resource', () => {
        const expectedResult = 'craft-1';
        expect(projectParticipantsListRowModel[0].craft).toBe(expectedResult);
    });

    it('should retrieve null if first craft is empty', () => {
        const emptyFirstCraft = [];
        expect(ProjectParticipantsListRowModel.setFirstCraft(emptyFirstCraft)).toBe(null);
    });

    it('should retrieve null if first phone number is empty', () => {
        const emptyFirsPhoneNumber = [];
        expect(ProjectParticipantsListRowModel.setFirstTelephone(emptyFirsPhoneNumber)).toBe(null);
    });

    it('should not add delete/update actions when resource does not contain delete/update link', () => {
        expect(projectParticipantsListRowModel[0].options).toEqual([]);
    });

    it('should set the delete action when resource contains delete link', () => {
        const participantDeleteOption = getDropdownItem(projectParticipantsListRowModel[1], DELETE_PARTICIPANT_ITEM_ID);

        expect(participantDeleteOption).toBeTruthy();
    });

    it('should set the resend action when resource contains resend link', () => {
        const participantResendOption = getDropdownItem(projectParticipantsListRowModel[4], RESEND_PARTICIPANT_INVITATION_ITEM_ID);

        expect(participantResendOption).toBeTruthy();
    });

    it('should set the update actions when resource contains update link', () => {
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.FM)).toBeTruthy();
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.CR)).toBeTruthy();
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.CSM)).toBeTruthy();
    });

    it('should mark the current user role as selected', () => {
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.FM).selected).toBeFalsy();
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.CR).selected).toBeFalsy();
        expect(getDropdownItem(projectParticipantsListRowModel[2], ParticipantRoleEnum.CSM).selected).toBeTruthy();
    });

    it('it should set correct participant user data depending on the participant status', () => {
        const participantWithActiveStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT);

        expect(participantWithActiveStatus.user.id).toBe(MOCK_PARTICIPANT.user.id);
        expect(participantWithActiveStatus.user.displayName).toBe(MOCK_PARTICIPANT.user.displayName);
        expect(participantWithActiveStatus.user.picture).toBe(MOCK_PARTICIPANT.user.picture);

        const participantWithInvitedStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT_4);

        expect(participantWithInvitedStatus.user.id).toBe(participantWithInvitedStatus.id);
        expect(participantWithInvitedStatus.user.displayName).toBeNull();
        expect(participantWithInvitedStatus.user.picture).toBeNull();

        const participantWithValidationStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT_3);

        expect(participantWithValidationStatus.user.id).toBe(participantWithValidationStatus.id);
        expect(participantWithValidationStatus.user.displayName).toBeNull();
        expect(participantWithValidationStatus.user.picture).toBeNull();
    });

    it('it should set correct participant company data depending on the participant status', () => {
        const participantWithActiveStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT);

        expect(participantWithActiveStatus.company.id).toBe(MOCK_PARTICIPANT.company.id);
        expect(participantWithActiveStatus.company.displayName).toBe(MOCK_PARTICIPANT.company.displayName);

        const participantWithInvitedStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT_4);

        expect(participantWithInvitedStatus.company.id).toBeNull();
        expect(participantWithInvitedStatus.company.displayName).toBe('-');

        const participantWithValidationStatus = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT_3);

        expect(participantWithValidationStatus.company.id).toBeNull();
        expect(participantWithValidationStatus.company.displayName).toBe('-');
    });
});
