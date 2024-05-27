/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {TabPanelComponent} from '../../app/shared/ui/tab-panels/tab-panel/tab-panel.component';

export const MOCK_TABS: TabPanelComponent[] = [
    {
        active: false,
        alignment: 'right',
        disabled: false,
        icon: 'ss-icons',
        title: 'Title A',
        id: '123'
    },
    {
        active: false,
        alignment: 'left',
        disabled: false,
        icon: 'ss-icons',
        title: 'Title B',
        id: '456'
    }
];
