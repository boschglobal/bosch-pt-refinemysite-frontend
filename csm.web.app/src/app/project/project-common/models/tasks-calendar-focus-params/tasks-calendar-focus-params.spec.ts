/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {TasksCalendarFocusParams} from './tasks-calendar-focus-params';

describe('Tasks Calendar Focus Params', () => {

    it('should parse the focus parameters from url when url has one parameters', () => {
        const focusUrlParam = `${ObjectTypeEnum.Task}_123`;
        const expectedFocusParam = new TasksCalendarFocusParams(ObjectTypeEnum.Task, ['123']);

        expect(TasksCalendarFocusParams.fromUrl(focusUrlParam)).toEqual(expectedFocusParam);
    });

    it('should parse the focus parameters from url when url has multiple parameters', () => {
        const focusUrlParam = `${ObjectTypeEnum.Task}_123_456`;
        const expectedFocusParam = new TasksCalendarFocusParams(ObjectTypeEnum.Task, ['123', '456']);

        expect(TasksCalendarFocusParams.fromUrl(focusUrlParam)).toEqual(expectedFocusParam);
    });

    it('should parse the focus parameters from url when url has no parameters', () => {
        const focusUrlParam = ObjectTypeEnum.Task;
        const expectedFocusParam = new TasksCalendarFocusParams(ObjectTypeEnum.Task, []);

        expect(TasksCalendarFocusParams.fromUrl(focusUrlParam)).toEqual(expectedFocusParam);
    });

    it('should not parse the focus parameters from url when type is not an ObjectTypeEnum', () => {
        const focusUrlParam = 'foo_123';

        expect(TasksCalendarFocusParams.fromUrl(focusUrlParam)).toBeNull();
    });

    it('should not parse the focus parameters from url when url is not provided', () => {
        expect(TasksCalendarFocusParams.fromUrl()).toBeNull();
    });

    it('should generate a url string from when focus has one parameters', () => {
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Task, ['123']);
        const expectedUrl = `${ObjectTypeEnum.Task}_123`;

        expect(focusParams.toString()).toBe(expectedUrl);
    });

    it('should generate a url string from when focus has multiple parameters', () => {
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Task, ['123', '456']);
        const expectedUrl = `${ObjectTypeEnum.Task}_123_456`;

        expect(focusParams.toString()).toBe(expectedUrl);
    });

    it('should convert a TasksCalendarFocusParams to an ObjectIdentifierPair for a given task', () => {
        const taskId = 'foo';
        const taskFocusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Task, [taskId]);
        const expectedObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);

        expect(taskFocusParams.toObjectIdentifierPair()).toEqual(expectedObject);
    });

    it('should convert a TasksCalendarFocusParams to an ObjectIdentifierPair for a given daycard', () => {
        const taskId = 'foo';
        const daycardId = 'bar';
        const taskFocusParams = new TasksCalendarFocusParams(ObjectTypeEnum.DayCard, [taskId, daycardId]);
        const expectedObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycardId);

        expect(taskFocusParams.toObjectIdentifierPair()).toEqual(expectedObject);
    });

    it('should convert a TasksCalendarFocusParams to an ObjectIdentifierPair for a given milestone', () => {
        const milestoneId = 'foo';
        const taskFocusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Milestone, [milestoneId]);
        const expectedObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);

        expect(taskFocusParams.toObjectIdentifierPair()).toEqual(expectedObject);
    });

    it('should convert a TasksCalendarFocusParams to a null for a not supported object type', () => {
        const taskFocusParams = new TasksCalendarFocusParams('UNKNOWN-TYPE' as ObjectTypeEnum, ['foo']);

        expect(taskFocusParams.toObjectIdentifierPair()).toBeNull();
    });
});
