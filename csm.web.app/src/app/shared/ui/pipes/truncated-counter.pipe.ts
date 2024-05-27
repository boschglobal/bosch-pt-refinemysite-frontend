/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'ssTruncatedCounter',
})
export class TruncatedCounterPipe implements PipeTransform {
    transform(value: number, maxValue: number): string {
        return value > maxValue ? `${maxValue}+` : value.toString();
    }
}
