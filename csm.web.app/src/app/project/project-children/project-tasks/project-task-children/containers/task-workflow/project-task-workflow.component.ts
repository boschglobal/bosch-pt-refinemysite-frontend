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
import {ActivatedRoute} from '@angular/router';
import {
    Subscription,
    zip
} from 'rxjs';
import {map} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {NavigationTabsRoutes} from '../../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {
    ROUTE_PARAM_TASK_ID,
    TASK_WORKFLOW_OUTLET_NAME
} from '../../../../../project-routing/project-route.paths';

@Component({
    selector: 'ss-project-task-workflow',
    templateUrl: './project-task-workflow.component.html',
    styleUrls: ['./project-task-workflow.component.scss'],
})
export class ProjectTaskWorkflowComponent implements OnInit, OnDestroy {
    /**
     * @description Outlet name for navigation tabs
     * @type {string}
     */
    public outlet: string = TASK_WORKFLOW_OUTLET_NAME;

    /**
     * @description Tab routes for navigation tabs
     * @type {NavigationTabsRoutes[]}
     */
    public routes: NavigationTabsRoutes[] = [];

    /**
     * @description Property with the information of when should sticky behaviour stop
     * @type {BreakpointsEnum}
     */
    public stickyBreakpointValue = BreakpointsEnum.lg;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _newsQueries: NewsQueries,
                private _activatedRoute: ActivatedRoute) {
        this._setRoutes();
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        const context = new ObjectIdentifierPair(ObjectTypeEnum.Task, this._activatedRoute.snapshot.params[ROUTE_PARAM_TASK_ID]);

        this._disposableSubscriptions.add(
            zip(
                this._newsQueries.observeItemsByIdentifierPair([context]),
                this._newsQueries.observeItemsByParentIdentifierPair([context]),
            ).pipe(
                map(([contextNews, parentContextNews]) => [...contextNews, ...parentContextNews]),
            ).subscribe(items => {
                this._setRoutes(!!items.length);
            })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setRoutes(hasNews = false): void {
        this.routes = [
            {
                label: 'Generic_Topics',
                link: 'topics'
            },
            {
                label: 'Task_Attachments_Label',
                link: 'attachments'
            },
            {
                label: 'Generic_Activities',
                link: 'activities',
                hasMarker: hasNews
            }
        ];
    }
}
