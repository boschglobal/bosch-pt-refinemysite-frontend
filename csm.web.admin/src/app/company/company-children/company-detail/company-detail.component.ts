import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {CompanyQueries} from '../../company-common/store/company.queries';
import {CompanyResource} from '../../company-common/api/resources/company.resource';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-company-detail',
    templateUrl: './company-detail.component.html',
    styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
    public routes = [
        {
            label: 'Generic_GeneralInfo',
            routerLink: ''
        },
        {
            label: 'Generic_Employees',
            routerLink: ''
        },
        {
            label: 'Generic_Features',
            routerLink: ''
        }
    ];

    public companyId: string;

    public company: CompanyResource;

    public activeLink: {
        label: string;
        routerLink: string;
    };

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _companyQueries: CompanyQueries,
                private _route: ActivatedRoute,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._fetchRouteId();
        this._setRoutes();
        this._setSubscriptions();
        this.activeLink = this.routes[0];
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyById(this.companyId)
                .subscribe(companies => this._setCompany(companies))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _fetchRouteId() {
        this._route.params.subscribe((params: any) => {
            this.companyId = params.id;
        });
    }

    private _setRoutes() {
        this.routes[0].routerLink = `/management/companies/${this.companyId}/detail`;
        this.routes[1].routerLink = `/management/companies/${this.companyId}/employees`;
        this.routes[2].routerLink = `/management/companies/${this.companyId}/features`;
    }

    private _setCompany(company: CompanyResource) {
        this.company = company;
    }
}
