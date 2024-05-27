/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    RfvKey,
    RfvResource,
} from '../../app/project/project-common/api/rfvs/resources/rfv.resource';
import {SaveRfvResource} from '../../app/project/project-common/api/rfvs/resources/save-rfv.resource';
import {RfvEntity} from '../../app/project/project-common/entities/rfvs/rfv';
import {NamedEnumReference} from '../../app/shared/misc/api/datatypes/named-enum-reference.datatype';

export const MOCK_RFV_WITH_DEACTIVATE_PERMISSION: RfvResource = {
    key: 'DELAYED_MATERIAL',
    name: 'Delay',
    active: true,
    _links: {
        deactivate: {href: 'deactivate'},
    },
};

export const MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY: RfvEntity = RfvEntity.fromRfvResource(MOCK_RFV_WITH_DEACTIVATE_PERMISSION);

export const MOCK_RFV_WITH_UPDATE_PERMISSION: RfvResource = {
    key: 'CUSTOM1',
    name: 'Custom 1',
    active: true,
    _links: {
        deactivate: {href: 'deactivate'},
        update: {href: 'update'},
    },
};

export const MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY: RfvEntity = RfvEntity.fromRfvResource(MOCK_RFV_WITH_UPDATE_PERMISSION);

export const MOCK_RFV_WITH_ACTIVATE_PERMISSION: RfvResource = {
    key: 'CUSTOM2',
    name: 'Custom 2',
    active: false,
    _links: {
        activate: {href: 'activate'},
        update: {href: 'update'},
    },
};

export const MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY: RfvEntity = RfvEntity.fromRfvResource(MOCK_RFV_WITH_ACTIVATE_PERMISSION);

export const MOCK_SAVE_RFV_ACTIVE: SaveRfvResource = {
    key: 'CHANGED_PRIORITY',
    active: true,
    name: 'foo',
};

export const MOCK_SAVE_RFV_INACTIVE: SaveRfvResource = {
    key: 'CHANGED_PRIORITY',
    active: false,
    name: 'bar',
};

export const MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'BAD_WEATHER',
    name: 'BAD_WEATHER',
};

export const MOCK_RFV_TOUCHUP_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'TOUCHUP',
    name: 'TOUCHUP',
};

export const MOCK_RFV_MANPOWER_SHORTAGE_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'MANPOWER_SHORTAGE',
    name: 'MANPOWER_SHORTAGE',
};

export const MOCK_RFV_CONCESSION_NOT_RECOGNIZED_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'CONCESSION_NOT_RECOGNIZED',
    name: 'CONCESSION_NOT_RECOGNIZED',
};

export const MOCK_RFV_CONCESSION_MISSING_INFOS_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'MISSING_INFOS',
    name: 'MISSING_INFOS',
};

export const MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'OVERESTIMATION',
    name: 'OVERESTIMATION',
};

export const MOCK_RFV_CONCESSION_DELAYED_MATERIAL_ENUM_REFERENCE: NamedEnumReference<RfvKey> = {
    key: 'DELAYED_MATERIAL',
    name: 'DELAYED_MATERIAL',
};
