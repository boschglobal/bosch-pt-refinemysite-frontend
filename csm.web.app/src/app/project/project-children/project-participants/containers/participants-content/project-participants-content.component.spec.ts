/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {flatten} from 'lodash';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANTS
} from '../../../../../../test/mocks/participants';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_TASK_RESOURCE} from '../../../../../../test/mocks/tasks';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {PaginatorData} from '../../../../../shared/ui/paginator/paginator-data.datastructure';
import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {SaveProjectParticipantResource} from '../../../../project-common/api/participants/resources/save-project-participant.resource';
import {ParticipantRoleEnum} from '../../../../project-common/enums/participant-role.enum';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectParticipantsListComponent} from '../../presentationals/participants-list/project-participants-list.component';
import {ProjectParticipantsTableComponent} from '../../presentationals/participants-table/project-participants-table.component';
import {ProjectParticipantsContentComponent} from './project-participants-content.component';
import {
    DELETE_PARTICIPANT_ITEM_ID,
    ProjectParticipantsListRowModel,
    RESEND_PARTICIPANT_INVITATION_ITEM_ID,
} from './project-participants-content.model';

describe('Project Participants Content Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsContentComponent>;
    let comp: ProjectParticipantsContentComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let router: Router;
    let mockedStore: any;
    let activatedRoute: ActivatedRoute;
    let modalService: ModalService;

    const projectParticipantQueriesMock = mock(ProjectParticipantQueries);

    const dataAutomationTableHeaderCompany = '[data-automation="table-header-company"]';
    const dataAutomationTableHeaderRole = '[data-automation="table-header-role"]';
    const dataAutomationNoItemsPendingParticipants = '[data-automation="ss-project-participants-content-no-items-pending-participants"]';

    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="table-${area}-${field}"]`;
    const getDropdownItem = (participant: ProjectParticipantsListRowModel, itemId: string): MenuItem<ProjectParticipantResource> =>
        flatten(participant.options.map(({items}) => items)).find(item => item.id === itemId);

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
            StoreModule.forRoot({}),
            EffectsModule.forRoot([]),
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        declarations: [
            ProjectParticipantsContentComponent,
            ProjectParticipantsListComponent,
            ProjectParticipantsTableComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    snapshot: {
                        parent: {
                            params: 'name',
                            paramMap: {
                                get: () => 123,
                            },
                        },
                    },
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: of({[ROUTE_PARAM_PROJECT_ID]: MOCK_PROJECT_1.id}),
                                }],
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                items: [MOCK_PROJECT_1],
                                currentItem: {
                                    id: MOCK_PROJECT_1.id,
                                },
                            },
                            projectParticipantSlice: {
                                currentItem: {
                                    id: MOCK_PARTICIPANT.id,
                                },
                                items: MOCK_PARTICIPANTS,
                                list: {
                                    pages: {0: MOCK_PARTICIPANTS.map(item => item.id)},
                                    pagination: new PaginatorData(),
                                    sort: new SorterData(),
                                    requestStatus: RequestStatusEnum.empty,
                                },
                            },
                            projectTaskSlice: {
                                currentItem: {
                                    id: MOCK_TASK_RESOURCE.id,
                                },
                                items: [MOCK_TASK_RESOURCE],
                            },
                        },
                    }
                ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantsContentComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        mockedStore = fixture.debugElement.injector.get(Store) as any;

        when(projectParticipantQueriesMock.getCurrentPage()).thenReturn(() => MOCK_PARTICIPANTS);
        when(projectParticipantQueriesMock.getListRequestStatus()).thenReturn(() => RequestStatusEnum.success);
        when(projectParticipantQueriesMock.getCurrentItemRequestStatus()).thenReturn(() => RequestStatusEnum.success);
        when(projectParticipantQueriesMock.getListSort()).thenReturn(() => new SorterData());
        when(projectParticipantQueriesMock.observeCurrentParticipantPageInitialized()).thenReturn(of(true));
        when(projectParticipantQueriesMock.observeCurrentParticipantListFiltersPendingStatusActive()).thenReturn(of(true));

        fixture.detectChanges();

        router = TestBed.inject(Router);
        activatedRoute = TestBed.inject(ActivatedRoute);
        modalService = TestBed.inject(ModalService);
    });

    afterAll(() => comp.ngOnDestroy());

    it('should trigger onSortTable with the right params when company is clicked', () => {
        const sorterData = new SorterData('company', SortDirectionEnum.asc);
        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(dataAutomationTableHeaderCompany).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalled();
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onSortTable with the right params when company is clicked twice', () => {
        const sorterData = new SorterData('company', SortDirectionEnum.desc);
        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(dataAutomationTableHeaderCompany).dispatchEvent(clickEvent);
        el.querySelector(dataAutomationTableHeaderCompany).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalled();
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onSortTable with the right params when role is clicked', () => {
        const sorterData = new SorterData('role', SortDirectionEnum.asc);
        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(dataAutomationTableHeaderRole).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalled();
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onClickRow when first row is clicked', () => {
        const field = '0';

        spyOn(comp, 'onClickRow').and.callThrough();
        fixture.detectChanges();
        el.querySelector(getTableAreaFieldSelector('row', field)).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onClickRow).toHaveBeenCalled();
    });

    it('should set isLoading to false if request status has success', waitForAsync(() => {
        when(projectParticipantQueriesMock.getListRequestStatus()).thenReturn(() => RequestStatusEnum.success);
        comp.ngOnInit();
        expect(comp.isLoading).toBe(false);
    }));

    it('should set isLoading to true if request status is in progress', waitForAsync(() => {
        when(projectParticipantQueriesMock.getListRequestStatus()).thenReturn(() => RequestStatusEnum.progress);
        comp.ngOnInit();
        expect(comp.isLoading).toBe(true);
    }));

    it('should set isLoading to false if request status has error', waitForAsync(() => {
        when(projectParticipantQueriesMock.getListRequestStatus()).thenReturn(() => RequestStatusEnum.error);
        comp.ngOnInit();
        expect(comp.isLoading).toBe(false);
    }));

    it('should navigateByUrl when onClickDetails() is triggered', () => {
        const projectId = activatedRoute.root.firstChild.snapshot.children[0].params[ROUTE_PARAM_PROJECT_ID];
        const projectParticipantsListRowModel: ProjectParticipantsListRowModel = {
            company: new ResourceReference('1', 'SYSTEM'),
            user: new ResourceReferenceWithPicture('1', 'SYSTEM', ''),
            role: '',
            craft: '',
            telephone: '',
            email: '',
            id: '123',
            options: null,
            status: ParticipantStatusEnum.ACTIVE,
            hasLink: true,
        };
        const url = ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, projectParticipantsListRowModel.id);

        spyOn(router, 'navigateByUrl').and.callThrough();
        comp.onClickDetails(projectParticipantsListRowModel);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should trigger a confirm dialog to delete the participant', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(mockedStore, 'dispatch').and.callThrough();

        const participantToDeleteIndex = 1;
        const participantRow = comp.participants[participantToDeleteIndex];
        const participant = MOCK_PARTICIPANTS[participantToDeleteIndex];
        const expectedConfirmAction = new ProjectParticipantActions.Delete.One(participant.id);
        const expectedCancelAction = new ProjectParticipantActions.Delete.OneReset();

        comp.handleDropdownItemClicked(getDropdownItem(participantRow, DELETE_PARTICIPANT_ITEM_ID));

        expect(modalService.open).toHaveBeenCalled();

        modalService.currentModalData.cancelCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedCancelAction);

        modalService.currentModalData.confirmCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedConfirmAction);
    });

    it('should trigger a confirm dialog to update the participant role to FM', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(mockedStore, 'dispatch').and.callThrough();

        const participantToUpdateIndex = 1;
        const updateParticipantRole = ParticipantRoleEnum.FM;
        const participantRow = comp.participants[participantToUpdateIndex];
        const participant = MOCK_PARTICIPANTS[participantToUpdateIndex];
        const expectedActionPayload = new SaveProjectParticipantResource(updateParticipantRole);
        const expectedConfirmAction = new ProjectParticipantActions.Update.One(participant.id, expectedActionPayload, participant.version);

        comp.handleDropdownItemClicked(getDropdownItem(participantRow, updateParticipantRole));

        expect(modalService.open).toHaveBeenCalled();

        modalService.currentModalData.cancelCallback();
        expect(mockedStore.dispatch).not.toHaveBeenCalled();

        modalService.currentModalData.confirmCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedConfirmAction);
    });

    it('should trigger a confirm dialog to update the participant role to CSM', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(mockedStore, 'dispatch').and.callThrough();

        const participantToUpdateIndex = 1;
        const updateParticipantRole = ParticipantRoleEnum.CSM;
        const participantRow = comp.participants[participantToUpdateIndex];
        const participant = MOCK_PARTICIPANTS[participantToUpdateIndex];
        const expectedActionPayload = new SaveProjectParticipantResource(updateParticipantRole);
        const expectedConfirmAction = new ProjectParticipantActions.Update.One(participant.id, expectedActionPayload, participant.version);

        comp.handleDropdownItemClicked(getDropdownItem(participantRow, updateParticipantRole));

        expect(modalService.open).toHaveBeenCalled();

        modalService.currentModalData.cancelCallback();
        expect(mockedStore.dispatch).not.toHaveBeenCalled();

        modalService.currentModalData.confirmCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedConfirmAction);
    });

    it('should trigger a confirm dialog to update the participant role to CSM', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(mockedStore, 'dispatch').and.callThrough();

        const participantToUpdateIndex = 1;
        const updateParticipantRole = ParticipantRoleEnum.CSM;
        const participantRow = comp.participants[participantToUpdateIndex];
        const participant = MOCK_PARTICIPANTS[participantToUpdateIndex];
        const expectedActionPayload = new SaveProjectParticipantResource(updateParticipantRole);
        const expectedConfirmAction = new ProjectParticipantActions.Update.One(participant.id, expectedActionPayload, participant.version);

        comp.handleDropdownItemClicked(getDropdownItem(participantRow, updateParticipantRole));

        expect(modalService.open).toHaveBeenCalled();

        modalService.currentModalData.cancelCallback();
        expect(mockedStore.dispatch).not.toHaveBeenCalled();

        modalService.currentModalData.confirmCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedConfirmAction);
    });

    it('should trigger a confirm dialog to resend the participant invitation', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(mockedStore, 'dispatch').and.callThrough();

        const invitationToResendIndex = 2;
        const participantRow = comp.participants[invitationToResendIndex];
        const participant = MOCK_PARTICIPANTS[invitationToResendIndex];
        const expectedConfirmAction = new ProjectParticipantActions.Request.ResendInvitation(participant.id);
        const expectedCancelAction = new ProjectParticipantActions.Request.ResendInvitationReset();

        comp.handleDropdownItemClicked(getDropdownItem(participantRow, RESEND_PARTICIPANT_INVITATION_ITEM_ID));

        expect(modalService.open).toHaveBeenCalled();

        modalService.currentModalData.confirmCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedConfirmAction);

        modalService.currentModalData.cancelCallback();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedCancelAction);
    });

    it('should return true for hasNoPendingParticipants and render no items component only if all conditions are met', () => {
        expect(comp.hasNoPendingParticipants).toBeFalsy();
        expect(el.querySelector(dataAutomationNoItemsPendingParticipants)).toBeNull();

        when(projectParticipantQueriesMock.observeCurrentParticipantPageInitialized()).thenReturn(of(true));
        when(projectParticipantQueriesMock.observeCurrentParticipantListFiltersPendingStatusActive()).thenReturn(of(true));
        when(projectParticipantQueriesMock.getCurrentPage()).thenReturn(() => []);
        when(projectParticipantQueriesMock.getListRequestStatus()).thenReturn(() => RequestStatusEnum.success);

        comp.ngOnInit();

        fixture.detectChanges();

        expect(comp.hasNoPendingParticipants).toBeTruthy();
        expect(el.querySelector(dataAutomationNoItemsPendingParticipants)).toBeDefined();
    });
});
