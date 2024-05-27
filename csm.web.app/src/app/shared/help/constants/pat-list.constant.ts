/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {SortDirectionEnum} from '../../ui/sorter/sort-direction.enum';
import {TableSettingsHeader} from '../../ui/table/table.component';

export const PAT_LIST_HEADERS: TableSettingsHeader[] = [
    {
        title: 'Generic_Name',
        field: 'description',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 8,
    },
    {
        title: 'Generic_Scope',
        field: 'scopes',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 10,
    },
    {
        title: 'ID',
        field: 'id',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 25,
    },
    {
        title: 'Generic_ExpiresOn',
        field: 'expiresAt',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 12,
    },
    {
        title: null,
        field: 'options',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 8,
    },
];
export const PAT_LIST_HEADERS_SMALL: TableSettingsHeader[] = [
    {
        title: 'Generic_Name',
        field: 'description',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 12,
    },
    {
        title: 'ID',
        field: 'id',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 20,
    },
    {
        title: null,
        field: 'options',
        sortable: {
            enabled: false,
            direction: SortDirectionEnum.neutral,
        },
        width: 5,
        headerStyle: {
            "min-width": "96px",
        },
    },
];
