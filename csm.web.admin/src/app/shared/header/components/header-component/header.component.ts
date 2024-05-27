/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {Subscription} from 'rxjs';

import {AuthService} from '../../../auth/auth.service';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {UserResource} from '../../../../user/api/resources/user.resource';

@Component({
  selector: 'ss-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public displayName: string;

  public indexRoute = [''];

  private _disposableSubscriptions: Subscription = new Subscription();

  constructor(private _authService: AuthService,
              private _userQueries: UserQueries) {
  }

  ngOnInit() {
    this._setSubscriptions();
  }

  ngOnDestroy() {
      this._unsetSubscriptions();
  }

  public handleLogout(): void {
    this._authService.logout();
  }

  private _setSubscriptions(): void {
    this._disposableSubscriptions.add(
      this._userQueries
          .observeAuthenticatedUser()
          .subscribe(user => this._setDisplayName(user))
    );
  }

  private _setDisplayName(user: UserResource): void {
    this.displayName = user.firstName + ' ' + user.lastName;
  }

  private _unsetSubscriptions(): void {
    this._disposableSubscriptions.unsubscribe();
  }
}
