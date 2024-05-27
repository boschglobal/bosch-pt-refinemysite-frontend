/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractItems} from '../datatypes/abstract-items.datatype';

export interface FeaturesSlice<F> {
    features: AbstractItems<F>;
}
