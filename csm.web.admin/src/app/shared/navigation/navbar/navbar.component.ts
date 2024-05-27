/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit
} from '@angular/core';
import {
    Router
} from '@angular/router';

@Component({
    selector: 'ss-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    public activeLink: {
        icon: string;
        label: string;
        routerLink: string;
    };

    public routes = [
        {
            icon: 'business',
            label: 'AppComponent_Companies',
            routerLink: '/management/companies'
        },
        {
            icon: 'person',
            label: 'AppComponent_Users',
            routerLink: '/management/users'
        },
        {
            icon: 'folder_open',
            label: 'AppComponent_Projects',
            routerLink: '/management/projects'
        },
        {
            icon: 'build',
            label: 'Generic_Features',
            routerLink: '/management/features'
        },
    ];

    constructor(public router: Router) {
    }

    ngOnInit(): void {
        this.activeLink = this.routes[0];
    }
}
