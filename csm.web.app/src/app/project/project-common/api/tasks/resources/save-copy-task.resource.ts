/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

export interface SaveCopyTaskResource {
    id: string;
    shiftDays: number;
    includeDayCards: boolean;
    parametersOverride: SaveCopyTaskParametersOverride;
}

export interface SaveCopyTaskParametersOverride {
    workAreaId: string;
}
