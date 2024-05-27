/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';

import {CompanyActions} from '../../../../company/company-common/store/company.actions';
import {
  CompanyEditComponent,
  CompanyEditDialogData
} from '../../company-edit/company-edit.component';
import {CompanyQueries} from '../../../company-common/store/company.queries';
import {CompanyResource} from '../../../company-common/api/resources/company.resource';
import {COMPANY_DELETE_CONFIRM_DIALOG_CONFIG} from '../../../../company/company-common/constants/company-confirm-delete-dialog-config';
import {ConfirmationDialogComponent} from '../../../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';
import {State} from '../../../../app.reducers';

@Component({
  selector: 'ss-company-detail-general',
  templateUrl: './company-detail-general.component.html',
  styleUrls: ['./company-detail-general.component.scss']
})
export class CompanyDetailGeneralComponent implements OnInit, OnDestroy {

  public company: CompanyResource;

  private _disposableSubscriptions: Subscription = new Subscription();

  constructor(private _companyQueries: CompanyQueries,
              private _dialog: MatDialog,
              private _router: Router,
              private _store: Store<State>) { }

  ngOnInit(): void {
    this._setSubscriptions();
  }

  ngOnDestroy() {
    this._unsetSubscriptions();
  }

  public openEditModal(): void {
    const data: CompanyEditDialogData = {
        companyId: this.company.id,
        version: this.company.version
    };

    const dialog = this._dialog.open(CompanyEditComponent, {data});
    dialog.componentInstance.cancel.subscribe(() => dialog.close());
  }

  public openDeleteModal(): void {
    const data = COMPANY_DELETE_CONFIRM_DIALOG_CONFIG;
    data.closeObservable = this._companyQueries.observeCurrentCompanyRequestStatus();
    const dialog = this._dialog.open(ConfirmationDialogComponent, {data});
    dialog.componentInstance.cancel.subscribe(() => {
      this._store.dispatch(new CompanyActions.Delete.OneReset());
      dialog.close();
    });
    dialog.componentInstance.confirm.subscribe(
      () => this._store.dispatch(new CompanyActions.Delete.One(this.company.id, this.company.version))
    );
    dialog.componentInstance.dialogSuccess.subscribe(() => this._router.navigate(['/management/companies']));
  }

  public canDelete(company: CompanyResource): boolean {
    return company?._links.hasOwnProperty('delete');
  }

  private _setSubscriptions(): void {
    this._disposableSubscriptions.add(
        this._companyQueries
            .observeCurrentCompany()
            .subscribe(company => this._setCompany(company))
    );
  }

  private _unsetSubscriptions(): void {
    this._disposableSubscriptions.unsubscribe();
  }

  private _setCompany(company: CompanyResource) {
    this.company = company;
  }
}
