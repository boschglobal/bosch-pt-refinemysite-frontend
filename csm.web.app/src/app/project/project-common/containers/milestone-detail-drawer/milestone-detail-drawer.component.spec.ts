/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_HEADER_WITH_WORKAREA,
    MOCK_MILESTONE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {MOCK_PARTICIPANT} from '../../../../../test/mocks/participants';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_WORKAREA_A} from '../../../../../test/mocks/workareas';
import {State} from '../../../../app.reducers';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {
    DRAWER_DATA,
    DrawerService
} from '../../../../shared/ui/drawer/api/drawer.service';
import {DrawerModule} from '../../../../shared/ui/drawer/drawer.module';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../store/participants/project-participant.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    CSS_CLASSES_MILESTONE_DETAIL_DRAWER,
    DELETE_MILESTONE_ITEM_ID,
    MilestoneDetailDrawerComponent
} from './milestone-detail-drawer.component';

describe('Milestone Detail Drawer Component', () => {
    let component: MilestoneDetailDrawerComponent;
    let fixture: ComponentFixture<MilestoneDetailDrawerComponent>;
    let de: DebugElement;
    let router: Router;
    let drawerService: DrawerService;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: Store<State>;

    const creatorParticipant: ProjectParticipantResource = MOCK_PARTICIPANT;
    const milestone: Milestone = MOCK_MILESTONE_HEADER_WITH_WORKAREA;
    const workArea: WorkareaResource = MOCK_WORKAREA_A;

    const projectParticipantQueriesMock = mock(ProjectParticipantQueries);
    const milestoneQueriesMock = mock(MilestoneQueries);
    const workAreaQueriesMock = mock(WorkareaQueries);

    const clickEvent = new Event('click');
    const milestoneDrawerCardUserSelector = '[data-automation="milestone-detail-drawer-card-user"]';
    const milestoneDrawerCloseSelector = '[data-automation="milestone-detail-drawer-close"]';
    const milestoneDrawerCreatorSelector = '[data-automation="milestone-detail-drawer-creator-label"]';
    const milestoneDrawerDescriptionSelector = '[data-automation="milestone-detail-drawer-description"]';
    const milestoneDrawerUpdateSelector = '[data-automation="milestone-detail-drawer-update"]';
    const deleteMilestoneItem: MenuItem = {
        id: DELETE_MILESTONE_ITEM_ID,
        label: 'Milestone_Delete_Label',
        type: 'button',
    };

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;
    const getDeleteDropdownItem = (): MenuItem =>
        flatten(component.dropdownItems.map(({items}) => items)).find(item => item.id === DELETE_MILESTONE_ITEM_ID);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            DrawerModule,
            TranslateModule.forRoot(),
        ],
        declarations: [
            MilestoneDetailDrawerComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigateByUrl']),
            },
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },{
                provide: WorkareaQueries,
                useValue: instance(workAreaQueriesMock),
            },
            {
                provide: DrawerService,
                useValue: jasmine.createSpyObj('DrawerService', ['close']),
            },
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
            },
            {
                provide: DRAWER_DATA,
                useValue: milestone.id,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneDetailDrawerComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        drawerService = TestBed.inject(DrawerService);
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(milestone));
        when(workAreaQueriesMock.observeWorkareaById(milestone.workArea.id)).thenReturn(of(workArea));
        when(projectParticipantQueriesMock.observeProjectParticipantById(milestone.creator.id)).thenReturn(of(creatorParticipant));

        modalService.open.and.callThrough();

        fixture.detectChanges();
    });

    it('should close drawer when close button is clicked', () => {
        getElement(milestoneDrawerCloseSelector).dispatchEvent(clickEvent);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should not show update button when user without update permission', () => {
        component.milestone = {
            ...milestone,
            permissions: {
                ...milestone.permissions,
                canUpdate: false,
            },
        };

        fixture.detectChanges();

        expect(getElement(milestoneDrawerUpdateSelector)).toBeFalsy();
    });

    it('should not show delete option when user without delete permission', () => {
        const milestoneWithoutDeletePermissions: Milestone = {
            ...milestone,
            permissions: {
                ...milestone.permissions,
                canDelete: false,
            },
        };

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(milestoneWithoutDeletePermissions));
        component.ngOnInit();

        expect(getDeleteDropdownItem()).toBeFalsy();
    });

    it('should show delete option when user with delete permission', () => {
        expect(getDeleteDropdownItem()).toBeTruthy();
    });

    it('should open delete modal when delete option is clicked', () => {
        component.handleDropdownItemClicked(deleteMilestoneItem);

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should dispatch MilestoneActions.Delete.One action when confirm delete button is clicked', () => {
        const {id, version} = milestone;

        spyOn(store, 'dispatch');
        modalService.open.and.callFake(params => params.data.confirmCallback());

        component.handleDropdownItemClicked(deleteMilestoneItem);

        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Delete.One(id, version));
    });

    it('should close drawer when milestone deletion is confirmed', () => {
        modalService.open.and.callFake(params => params.data.completeCallback());

        component.handleDropdownItemClicked(deleteMilestoneItem);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should dispatch MilestoneActions.Delete.OneReset action when cancel delete button is clicked ', () => {
        spyOn(store, 'dispatch');
        modalService.open.and.callFake(params => params.data.cancelCallback());

        component.handleDropdownItemClicked(deleteMilestoneItem);

        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Delete.OneReset());
    });

    it('should set the component milestone when observeMilestoneById emits', () => {
        expect(component.milestone).toBe(milestone);
    });

    it('should close drawer when observeMilestoneById emits with falsy value', () => {
        spyOn(component, 'handleClose');
        component.milestone = undefined;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(null));
        component.ngOnInit();

        expect(component.milestone).toBeUndefined();
        expect(component.handleClose).toHaveBeenCalled();
    });

    it('should request the milestone creator participant when observeMilestoneById emits', () => {
        const {creator: {id}} = milestone;

        spyOn(store, 'dispatch');
        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectParticipantActions.Request.One(id));
    });

    it('should set the component creatorParticipant when observeProjectParticipantById emits', () => {
        expect(component.creatorParticipant).toBe(creatorParticipant);
    });

    it('should set drawer css class to "ss-milestone-detail-drawer--craft" when milestone is of type Craft', () => {
        const craftMilestone = MOCK_MILESTONE_CRAFT;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(craftMilestone));
        component.ngOnInit();

        expect(component.drawerClass).toBe(CSS_CLASSES_MILESTONE_DETAIL_DRAWER[MilestoneTypeEnum.Craft]);
    });

    it('should set drawer css class to "ss-milestone-detail-drawer--investor" when milestone is of type Investor', () => {
        const investorMilestone = MOCK_MILESTONE_HEADER;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(investorMilestone));
        component.ngOnInit();

        expect(component.drawerClass).toBe(CSS_CLASSES_MILESTONE_DETAIL_DRAWER[MilestoneTypeEnum.Investor]);
    });

    it('should set drawer css class to "ss-milestone-detail-drawer--project" when milestone is of type Project', () => {
        const projectMilestone = MOCK_MILESTONE_WORKAREA;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(projectMilestone));
        component.ngOnInit();

        expect(component.drawerClass).toBe(CSS_CLASSES_MILESTONE_DETAIL_DRAWER[MilestoneTypeEnum.Project]);
    });

    it('should set button style "inverted" when milestone is of type Craft', () => {
        const craftMilestone = MOCK_MILESTONE_CRAFT;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(craftMilestone));
        component.ngOnInit();

        expect(component.buttonStyle).toBe('inverted');
    });

    it('should set button style "inverted-grey" when milestone is of type Investor', () => {
        const investorMilestone = MOCK_MILESTONE_HEADER;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(investorMilestone));
        component.ngOnInit();

        expect(component.buttonStyle).toBe('inverted-grey');
    });

    it('should set button style "inverted" when milestone is of type Project', () => {
        const projectMilestone = MOCK_MILESTONE_WORKAREA;

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(projectMilestone));
        component.ngOnInit();

        expect(component.buttonStyle).toBe('inverted');
    });

    it('should display the description label when milestone has description', () => {
        expect(getElement(milestoneDrawerDescriptionSelector)).toBeTruthy();
    });

    it('should not display the description label milestone hasn\'t description ', () => {
        const milestoneWithoutDescription: Milestone = {
            ...milestone,
            description: undefined,
        };

        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(milestoneWithoutDescription));
        component.ngOnInit();
        fixture.detectChanges();

        expect(getElement(milestoneDrawerDescriptionSelector)).toBeFalsy();
    });

    it('should only display creator label after the participant has been received from the Store ', () => {
        const projectParticipantSubject: Subject<ProjectParticipantResource> = new Subject<ProjectParticipantResource>();

        component.creatorParticipant = undefined;
        when(projectParticipantQueriesMock.observeProjectParticipantById(milestone.creator.id)).thenReturn(projectParticipantSubject);
        component.ngOnInit();
        fixture.detectChanges();

        expect(getElement(milestoneDrawerCreatorSelector)).toBeFalsy();

        projectParticipantSubject.subscribe(participant => {
            fixture.detectChanges();

            expect(component.creatorParticipant).toBe(participant);
            expect(getElement(milestoneDrawerCreatorSelector)).toBeTruthy();
        });

        projectParticipantSubject.next(creatorParticipant);
    });

    it('should navigate to user profile when user card is clicked', () => {
        const {id: creatorId, project: {id: projectId}} = creatorParticipant;
        const expectedResult = ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, creatorId);

        getElement(milestoneDrawerCardUserSelector).dispatchEvent(clickEvent);

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedResult);
    });

    it('should open Edit Milestone Modal when edit button is clicked', () => {
        spyOn(component, 'handleUpdate').and.callThrough();

        const focus = null;
        const expectedResult = {
            id: ModalIdEnum.UpdateMilestone,
            data: {
                milestoneId: milestone.id,
                focus,
            },
        };

        component.ngOnInit();
        fixture.detectChanges();

        getElement(milestoneDrawerUpdateSelector).dispatchEvent(clickEvent);

        expect(component.handleUpdate).toHaveBeenCalled();
        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should open Edit Milestone Modal with focus when specified', () => {
        const focus = 'location';
        const expectedResult = {
            id: ModalIdEnum.UpdateMilestone,
            data: {
                milestoneId: milestone.id,
                focus,
            },
        };

        component.handleUpdate(focus);

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should set workArea if milestone.workarea is set', () => {
        component.ngOnInit();

        expect(component.workArea).toBe(MOCK_WORKAREA_A);
    });

    it('should not set workArea if milestone.workarea is not set', () => {
        when(milestoneQueriesMock.observeMilestoneById(milestone.id)).thenReturn(of(MOCK_MILESTONE_HEADER));

        component.ngOnInit();

        const {workArea: wa} = component.milestone;

        expect(wa).toBeNull();
    });
});
