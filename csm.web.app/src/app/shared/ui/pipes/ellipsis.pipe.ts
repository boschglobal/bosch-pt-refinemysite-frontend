/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({name: 'ssEllipsis'})
export class EllipsisPipe implements PipeTransform {
    transform(value: string, maxChars?: number | null): string {
        return maxChars && value && value.length > maxChars
            ? value.substring(0, maxChars - 3) + '...' : value;
    }
}
