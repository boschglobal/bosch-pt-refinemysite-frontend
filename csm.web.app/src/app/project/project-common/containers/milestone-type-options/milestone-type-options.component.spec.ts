/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C
} from '../../../../../test/mocks/crafts';
import {MockStore} from '../../../../../test/mocks/store';
import {State} from '../../../../app.reducers';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {MilestoneMarkerComponent} from '../../presentationals/milestone-marker/milestone-marker.component';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {CurrentProjectPermissions} from '../../store/projects/project.slice';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {
    MilestoneTypeOption,
    MilestoneTypeOptionsComponent,
} from './milestone-type-options.component';

describe('Milestone Type Options Component', () => {
    let comp: MilestoneTypeOptionsComponent;
    let fixture: ComponentFixture<MilestoneTypeOptionsComponent>;
    let storeMock: Store<State>;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);

    const currentProjectPermissions: CurrentProjectPermissions = {
        canCreateCraftMilestone: true,
        canCreateInvestorMilestone: true,
        canCreateProjectMilestone: true,
    } as CurrentProjectPermissions;
    const crafts: ProjectCraftResource[] = [
        MOCK_PROJECT_CRAFT_A,
        MOCK_PROJECT_CRAFT_B,
        MOCK_PROJECT_CRAFT_C,
    ];

    const getDropdownItemsByMilestoneType = (type: MilestoneTypeEnum): MenuItem<MilestoneTypeOption>[] =>
        flatten(comp.items.map(({items}) => items)).filter(item => item.value.marker.type === type);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [TranslateModule.forRoot()],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ProjectCraftQueries,
                useFactory: () => instance(projectCraftQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
        declarations: [
            MilestoneMarkerComponent,
            MilestoneTypeOptionsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneTypeOptionsComponent);
        comp = fixture.componentInstance;

        storeMock = TestBed.inject(Store);

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(currentProjectPermissions));
        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(of(crafts));

        fixture.detectChanges();
    });

    it('should show Investors Milestone Option when user has permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Investor).length).toBe(1);
    });

    it('should not show Investors Milestone Option when user doesn\'t have permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: false,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Investor).length).toBe(0);
    });

    it('should show Project Milestone Option when user has permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateProjectMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Project).length).toBe(1);
    });

    it('should not show Project Milestone Option when user doesn\'t have permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateProjectMilestone: false,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Project).length).toBe(0);
    });

    it('should show Craft Milestone Options when user has permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Craft).length).toBeGreaterThan(0);
    });

    it('should not show Craft Milestone Option when user doesn\'t have permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateCraftMilestone: false,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Craft).length).toBe(0);
    });

    it('should show an option for each craft when user has permission to create it', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(of(crafts));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Craft).length).toBe(crafts.length);
    });

    it('should not show list of craft options when there are no crafts', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(of([]));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDropdownItemsByMilestoneType(MilestoneTypeEnum.Craft).length).toBe(0);
    });

    it('should not show list of non-craft options when user doesn\'t have permission to create Project and Investor milestones', () => {
        const permissions: CurrentProjectPermissions = {
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: false,
            canCreateCraftMilestone: true,
        } as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.items.length).toBe(1);
        expect(comp.items[0].title).toBe('Generic_CraftsLabel');
    });

    it('should emit selectOption when a craft option is clicked', () => {
        spyOn(comp.selectOption, 'emit');
        const {id, color, name} = crafts[0];
        const expectedResult: MilestoneTypeOption = {
            marker: {
                type: MilestoneTypeEnum.Craft,
                color,
            },
            craftId: id,
        };
        const menuItem: MenuItem<MilestoneTypeOption> = {
            id,
            type: 'button',
            label: name,
            value: expectedResult,
        };

        comp.handleSelect(menuItem);

        expect(comp.selectOption.emit).toHaveBeenCalledWith(expectedResult);
    });

    it('should request Crafts when component inits', () => {
        const expectedAction = new ProjectCraftActions.Request.All();
        spyOn(storeMock, 'dispatch');

        comp.ngOnInit();

        expect(storeMock.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
