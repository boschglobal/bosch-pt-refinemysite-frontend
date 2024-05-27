/*
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 */

export class SaveUserRoleResource {
    public admin: boolean;

    constructor(admin: boolean) {
      this.admin = admin;
    }
  }
