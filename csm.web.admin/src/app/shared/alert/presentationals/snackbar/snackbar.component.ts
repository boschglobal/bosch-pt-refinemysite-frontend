/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';

import {AlertResource} from '../../api/resources/alert.resource';

@Component({
  selector: 'ss-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  constructor(
      @Inject(MAT_SNACK_BAR_DATA) public data: AlertResource,
      public snackBarRef: MatSnackBarRef<SnackbarComponent>) {
  }
}
