/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
export class PhoneNumber {
    public countryCode: string;
    public phoneNumber: string;
    public phoneNumberType: string;

    constructor(countryCode: string, phoneNumber: string, phoneNumberType: string) {
        this.countryCode = countryCode;
        this.phoneNumber = phoneNumber;
        this.phoneNumberType = phoneNumberType;
    }
}
