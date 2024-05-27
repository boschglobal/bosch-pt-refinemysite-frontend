/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

export class CreateProjectCopyResource {
    public projectName: string;
    public workingAreas: boolean;
    public disciplines: boolean;
    public milestones: boolean;
    public tasks: boolean;
    public dayCards: boolean;
    public keepTaskStatus: boolean;
    public keepTaskAssignee: boolean;
}
