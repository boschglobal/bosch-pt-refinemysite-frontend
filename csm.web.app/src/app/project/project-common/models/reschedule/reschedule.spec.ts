/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {MOCK_MILESTONE_CRAFT} from '../../../../../test/mocks/milestones';
import {MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS} from '../../../../../test/mocks/project-reschedule';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {Reschedule} from './reschedule';

describe('Reschedule Model', () => {
    it('should create a new reschedule model instance from a Reschedule Resource', () => {
        const rescheduleResource = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS;
        const failedTasks = [MOCK_TASK];
        const failedMilestones = [MOCK_MILESTONE_CRAFT];

        const expectedModel: Reschedule = new Reschedule();
        expectedModel.successful = rescheduleResource.successful;
        expectedModel.failed = {
            milestones: failedMilestones,
            tasks: failedTasks,
        };

        const model = Reschedule.fromRescheduleResource(
            rescheduleResource,
            failedTasks, failedMilestones
        );

        expect(model).toEqual(expectedModel);
    });
});
