/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../helpers/enum.helper';

export enum ObjectTypeEnum {
    DayCard = 'DAYCARD',
    Message = 'MESSAGE',
    MessageAttachment = 'MESSAGEATTACHMENT',
    Milestone = 'MILESTONE',
    MilestoneList = 'MILESTONELIST',
    Project = 'PROJECT',
    ProjectParticipant = 'PARTICIPANT',
    ProjectPicture = 'PROJECTPICTURE',
    Relation = 'RELATION',
    Task = 'TASK',
    TaskAttachment = 'TASKATTACHMENT',
    TaskConstraints = 'TASKACTION',
    TaskSchedule = 'TASKSCHEDULE',
    Topic = 'TOPIC',
    TopicAttachment = 'TOPICATTACHMENT',
    UserPicture = 'USERPICTURE',
    Workarea = 'WORKAREA',
}

export const ObjectTypeEnumHelper = new EnumHelper('ObjectTypeEnum', ObjectTypeEnum);
