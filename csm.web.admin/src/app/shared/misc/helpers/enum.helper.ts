/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class EnumHelper {

    constructor(private labelPrefix: string, private enumerator: any) {
    }

    public getLabelByKey(key: string) {
        return `${this.labelPrefix}_${key}`;
    }

    public getLabelByValue(value: any) {
        const k = this.getKeyByValue(value).toString();
        return this.getLabelByKey(k);
    }

    public getValues(): any[] {
        return Object.keys(this.enumerator).map(key => this.enumerator[key]);
    }

    public getKeyByValue(value): any {
        return Object.keys(this.enumerator).find(key => this.enumerator[key] === value);
    }

    public getSelectOptions(): SelectOption[] {
        return Object.keys(this.enumerator).map(key => ({
            label: this.getLabelByKey(key),
            value: this.enumerator[key]
        } as SelectOption));
    }
}

export interface SelectOption {
    label: string;
    value: any;
}
