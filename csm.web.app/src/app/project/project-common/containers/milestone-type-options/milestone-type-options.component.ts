/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {MilestoneMarkerModel} from '../../presentationals/milestone-marker/milestone-marker.component';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {CurrentProjectPermissions} from '../../store/projects/project.slice';
import {ProjectSliceService} from '../../store/projects/project-slice.service';

@Component({
    selector: 'ss-milestone-type-options',
    templateUrl: './milestone-type-options.component.html',
    styleUrls: ['./milestone-type-options.component.scss'],
})
export class MilestoneTypeOptionsComponent implements OnInit, OnDestroy {

    @Output()
    public selectOption: EventEmitter<MilestoneTypeOption> = new EventEmitter<MilestoneTypeOption>();

    @ViewChild('markerTemplate', {static: true})
    public markerTemplate: TemplateRef<any>;

    public items: MenuItemsList<MilestoneTypeOption>[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _projectCraftQueries: ProjectCraftQueries,
                private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._requestCrafts();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSelect(item: MenuItem<MilestoneTypeOption>): void {
        this.selectOption.emit(item.value);
    }

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _setItems(projectPermissions: CurrentProjectPermissions, crafts: ProjectCraftResource[]): void {
        const {canCreateInvestorMilestone, canCreateProjectMilestone, canCreateCraftMilestone} = projectPermissions;
        const nonCraftMilestonesOptions: MenuItemsList<MilestoneTypeOption> = {
            customFigureTemplate: this.markerTemplate,
            items: [],
        };
        const craftMilestonesOptions: MenuItemsList<MilestoneTypeOption> = {
            customFigureTemplate: this.markerTemplate,
            items: [],
            title: 'Generic_CraftsLabel',
        };

        if (canCreateInvestorMilestone) {
            nonCraftMilestonesOptions.items.push({
                id: MilestoneTypeEnum.Investor,
                label: 'MilestoneTypeEnum_Investor',
                type: 'button',
                value: {
                    marker: {
                        type: MilestoneTypeEnum.Investor,
                    },
                },
            });
        }

        if (canCreateProjectMilestone) {
            nonCraftMilestonesOptions.items.push({
                id: MilestoneTypeEnum.Project,
                label: 'MilestoneTypeEnum_Project',
                type: 'button',
                value: {
                    marker: {
                        type: MilestoneTypeEnum.Project,
                    },
                },
            });
        }

        if (canCreateCraftMilestone) {
            craftMilestonesOptions.items = crafts.map(({id, name, color}) => ({
                id,
                label: name,
                type: 'button',
                value: {
                    marker: {
                        color,
                        type: MilestoneTypeEnum.Craft,
                    },
                    craftId: id,
                },
            }));
        }

        this.items = [
            ...nonCraftMilestonesOptions.items.length ? [nonCraftMilestonesOptions] : [],
            ...craftMilestonesOptions.items.length ? [craftMilestonesOptions] : [],
        ];
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._projectSliceService.observeCurrentProjectPermissions(),
                this._projectCraftQueries.observeCraftsSortedByName(),
            ]).subscribe(([projectPermissions, crafts]) => this._setItems(projectPermissions, crafts))
        )
        ;
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface MilestoneTypeOption {
    marker: MilestoneMarkerModel;
    craftId?: string;
}
