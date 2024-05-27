/*
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 */

export class SaveUserLockResource {
    public locked: boolean;

    constructor(locked: boolean) {
      this.locked = locked;
    }
  }
