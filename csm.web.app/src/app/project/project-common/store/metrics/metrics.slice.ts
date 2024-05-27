/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractItems} from '../../../../shared/misc/store/datatypes/abstract-items.datatype';
import {MetricsResource} from '../../api/metrics/resources/metrics.resource';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

export interface MetricsSlice {
    fulfilledDayCardsAll: AbstractItems<MetricsResource>;
    fulfilledDayCardsGrouped: AbstractItems<MetricsResource>;
    reasonsForVarianceAll: AbstractItems<MetricsResource>;
    timeFilters: ProjectMetricsTimeFilters;
}
