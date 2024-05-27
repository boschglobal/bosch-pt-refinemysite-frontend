/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NamedEnumReference} from '../../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RfvKey} from '../../rfvs/resources/rfv.resource';

export class MetricsResource {
    public start: Date;
    public end: Date;
    public totals: DayCardMetricsResource;
    public series: DayCardMetricsResourceSerie[];
    public company?: ResourceReference;
    public projectCraft?: ResourceReference;
}

export class DayCardMetricsResource {
    public ppc?: number;
    public rfv?: DayCardMetricsResourceRfv[];

}

export class DayCardMetricsResourceSerie {
    public start: Date;
    public end: Date;
    public metrics: DayCardMetricsResource;
}

export class DayCardMetricsResourceRfv {
    public reason: NamedEnumReference<RfvKey>;
    public value: number;
}
