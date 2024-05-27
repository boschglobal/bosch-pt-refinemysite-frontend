/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    MetricsListResource,
    MetricsListResourceLinks
} from '../../app/project/project-common/api/metrics/resources/metrics-list.resource';
import {
    DayCardMetricsResourceSerie,
    MetricsResource
} from '../../app/project/project-common/api/metrics/resources/metrics.resource';
import {
    MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
    MOCK_RFV_CONCESSION_DELAYED_MATERIAL_ENUM_REFERENCE,
    MOCK_RFV_CONCESSION_MISSING_INFOS_ENUM_REFERENCE,
    MOCK_RFV_CONCESSION_NOT_RECOGNIZED_ENUM_REFERENCE,
    MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE,
    MOCK_RFV_MANPOWER_SHORTAGE_ENUM_REFERENCE,
    MOCK_RFV_TOUCHUP_ENUM_REFERENCE,
} from './rfvs';

export const MOCK_METRICS_ITEM_ALL_A: MetricsResource = {
    start: new Date('2019-02-13'),
    end: new Date('2019-03-26'),
    totals: {
        ppc: 55,
        rfv: [
            {
                reason: MOCK_RFV_TOUCHUP_ENUM_REFERENCE,
                value: 9
            },
            {
                reason: MOCK_RFV_MANPOWER_SHORTAGE_ENUM_REFERENCE,
                value: 10
            },
            {
                reason: MOCK_RFV_CONCESSION_NOT_RECOGNIZED_ENUM_REFERENCE,
                value: 6
            },
            {
                reason: MOCK_RFV_CONCESSION_MISSING_INFOS_ENUM_REFERENCE,
                value: 7
            },
            {
                reason: MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE,
                value: 10
            },
            {
                reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
                value: 9
            },
        ]
    },
    series: [
        {
            start: new Date('2019-02-11'),
            end: new Date('2019-02-17'),
            metrics: {
                ppc: 22,
                rfv: [
                    {
                        reason: MOCK_RFV_TOUCHUP_ENUM_REFERENCE,
                        value: 1
                    },
                    {
                        reason: MOCK_RFV_MANPOWER_SHORTAGE_ENUM_REFERENCE,
                        value: 10
                    },
                ]
            }
        },
        {
            start: new Date('2019-02-18'),
            end: new Date('2019-02-24'),
            metrics: {
                ppc: 11,
                rfv: [
                    {
                        reason: MOCK_RFV_CONCESSION_NOT_RECOGNIZED_ENUM_REFERENCE,
                        value: 6
                    },
                    {
                        reason: MOCK_RFV_CONCESSION_MISSING_INFOS_ENUM_REFERENCE,
                        value: 7
                    },
                    {
                        reason: MOCK_RFV_TOUCHUP_ENUM_REFERENCE,
                        value: 1
                    },
                ]
            }
        },
        {
            start: new Date('2019-02-25'),
            end: new Date('2019-03-03'),
            metrics: {
                ppc: 3,
                rfv: [
                    {
                        reason: MOCK_RFV_TOUCHUP_ENUM_REFERENCE,
                        value: 7
                    },
                ]
            }
        },
        {
            start: new Date('2019-03-04'),
            end: new Date('2019-03-10'),
            metrics: {
                ppc: 7,
                rfv: []
            }
        },
        {
            start: new Date('2019-03-11'),
            end: new Date('2019-03-17'),
            metrics: {
                ppc: 9,
                rfv: [
                    {
                        reason: MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE,
                        value: 5
                    },
                ]
            }
        },
        {
            start: new Date('2019-03-18'),
            end: new Date('2019-03-24'),
            metrics: {
                ppc: 3,
                rfv: []
            }
        },
        {
            start: new Date('2019-03-25'),
            end: new Date('2019-03-31'),
            metrics: {
                ppc: 5,
                rfv: [
                    {
                        reason: MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE,
                        value: 8
                    },
                    {
                        reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
                        value: 9
                    },
                ]
            }
        },
        {
            start: new Date('2019-04-01'),
            end: new Date('2019-04-07'),
            metrics: {
                ppc: 8,
                rfv: [
                    {
                        reason: MOCK_RFV_CONCESSION_OVERESTIMATION_ENUM_REFERENCE,
                        value: 2
                    },
                ]
            }
        },
        {
            start: new Date('2019-04-08'),
            end: new Date('2019-04-14'),
            metrics: {
                rfv: []
            }
        }
    ]
};

export const MOCK_METRICS_ITEM_GROUPED_A: MetricsResource = {
    start: new Date('2019-02-13'),
    end: new Date('2019-03-26'),
    totals: {
        ppc: 100,
        rfv: [
            {
                reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
                value: 4
            },
            {
                reason: MOCK_RFV_CONCESSION_DELAYED_MATERIAL_ENUM_REFERENCE,
                value: 3
            }
        ]
    },
    series: [
        {
            start: new Date('2019-02-20'),
            end: new Date('2019-02-26'),
            metrics: {
                ppc: 100,
                rfv: [
                    {
                        reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
                        value: 4
                    },
                    {
                        reason: MOCK_RFV_CONCESSION_DELAYED_MATERIAL_ENUM_REFERENCE,
                        value: 3
                    }
                ]
            }
        }
    ],
    company: {
        displayName: 'ACME',
        id: '28fcbc5a-7957-42b8-a4e5-a162aec11564'
    },
    projectCraft: {
        displayName: 'Arts and crafts',
        id: 'f776dbfa-8bd8-4032-bbeb-815440cfedc0'
    }
};

export const MOCK_METRICS_ITEM_GROUPED_B: MetricsResource = {
    start: new Date('2019-02-13'),
    end: new Date('2020-03-26'),
    totals: {},
    series: [
        {
            start: new Date('2019-02-20'),
            end: new Date('2020-02-26'),
            metrics: {}
        }
    ]
};

export const MOCK_METRICS_LINKS: MetricsListResourceLinks = {
    self: {
        href: 'http://localhost:8080/v1/projects/{projectId}/metrics?startDate={startDate}&duration={duration}&type={type}{&grouped}',
        templated: true,
    }
};

export const MOCK_METRICS_LIST_ALL: MetricsListResource = {
    items: [MOCK_METRICS_ITEM_ALL_A],
    _links: MOCK_METRICS_LINKS
};

export const MOCK_METRICS_LIST_GROUPED: MetricsListResource = {
    items: [MOCK_METRICS_ITEM_GROUPED_A],
    _links: MOCK_METRICS_LINKS
};

export const MOCK_METRICS_RFV_ALL_A: MetricsResource = Object.assign({},
    MOCK_METRICS_ITEM_ALL_A, {
        totals: {
            rfv: MOCK_METRICS_ITEM_ALL_A.totals.rfv
        },
        series: MOCK_METRICS_ITEM_ALL_A.series.map(item => ({
            start: item.start,
            end: item.end,
            metrics: {
                rfv: item.metrics.rfv
            }
        } as DayCardMetricsResourceSerie))
    }
);

export const MOCK_METRICS_RFV_ALL: MetricsListResource = {
    items: [MOCK_METRICS_RFV_ALL_A],
    _links: MOCK_METRICS_LINKS,
};
