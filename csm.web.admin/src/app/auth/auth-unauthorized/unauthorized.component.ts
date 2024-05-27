/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
  Component,
  OnInit
} from '@angular/core';

import {AuthService} from '../../shared/auth/auth.service';

@Component({
  selector: 'ss-unauthorized',
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent implements OnInit {

  constructor(
      private _authService: AuthService) { }

  ngOnInit(): void {
  }

  handleLogout() {
    this._authService.logout();
  }
}
