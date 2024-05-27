/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class Address {
    public street: string;
    public houseNumber: string;
    public zipCode: string;
    public city: string;

    constructor(
        street: string,
        houseNumber: string,
        zipCode: string,
        city: string,
    ) {
        this.street = street;
        this.houseNumber = houseNumber;
        this.zipCode = zipCode;
        this.city = city;
    }
}
