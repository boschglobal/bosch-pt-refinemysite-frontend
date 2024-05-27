/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {UntypedFormBuilder} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs/index';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ActivatedRouteStub} from '../../../../../../test/stubs/activated-route.stub';
import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectParticipantFilters} from '../../../../project-common/store/participants/slice/project-participant-filters';
import {ParticipantToolbarFilterEnum} from '../../enums/participant-toolbar-filter.enum';
import {ProjectParticipantsCaptureComponent} from '../participants-capture/project-participants-capture.component';
import {ProjectParticipantsComponent} from './project-participants.component';

describe('Project Participants Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsComponent>;
    let comp: ProjectParticipantsComponent;
    let flyoutService: FlyoutService;
    let mockedStore: any;

    const projectParticipantQueriesMock: ProjectParticipantQueries = mock(ProjectParticipantQueries);
    const activeParticipantsStatus: ParticipantStatusEnum[] = ProjectParticipantFilters.getActiveParticipantStatus();
    const pendingParticipantsStatus: ParticipantStatusEnum[] = ProjectParticipantFilters.getParticipantPendingStatus();
    const allParticipantsStatus = ProjectParticipantFilters.getAllParticipantStatus();

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useClass: ActivatedRouteStub,
            },
            {
                provide: ProjectParticipantQueries,
                useFactory: () => instance(projectParticipantQueriesMock),
            },
            UntypedFormBuilder,
            HttpClient,
            provideMockStore({}),
        ],
        declarations: [
            ProjectParticipantsCaptureComponent,
            ProjectParticipantsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantsComponent);
        comp = fixture.componentInstance;

        mockedStore = TestBed.inject(Store);
        flyoutService = TestBed.inject(FlyoutService);

        when(projectParticipantQueriesMock.observeInviteProjectParticipantPermission()).thenReturn(of(true));
        when(projectParticipantQueriesMock.getCurrentItemRequestStatus()).thenReturn((state: State) => RequestStatusEnum.success);

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should set hasInvitePermission to true when observeInviteProjectParticipantPermission returns true', () => {
        when(projectParticipantQueriesMock.observeInviteProjectParticipantPermission()).thenReturn(of(true));

        comp.ngOnInit();

        expect(comp.hasInvitePermission).toBeTruthy();
    });

    it('should set hasInvitePermission to false when observeInviteProjectParticipantPermission returns false', () => {
        when(projectParticipantQueriesMock.observeInviteProjectParticipantPermission()).thenReturn(of(false));

        comp.ngOnInit();

        expect(comp.hasInvitePermission).toBeFalsy();
    });

    it('should set isSortingFlyoutOpen to false on flyout closeEvents if flyout ID matches the sort flyout ID', () => {
        comp.isSortingFlyoutOpen = true;

        flyoutService.closeEvents.next(comp.sortFlyout.id);

        expect(comp.isSortingFlyoutOpen).toBeFalsy();
    });

    it('should not set isSortingFlyoutOpen to false on flyout closeEvents if flyout ID does not match the sort flyout ID', () => {
        comp.isSortingFlyoutOpen = true;

        flyoutService.closeEvents.next('foo');

        expect(comp.isSortingFlyoutOpen).not.toBeFalsy();
    });

    it('should call open sort flyout on toggleSortFlyout if closed, set isSortingFlyoutOpen to true ' +
        'and set showParticipantInviteCapture to false', () => {
        spyOn(flyoutService, 'open').and.callThrough();

        comp.isSortingFlyoutOpen = false;

        comp.toggleSortFlyout();

        expect(comp.isSortingFlyoutOpen).toBeTruthy();
        expect(comp.showParticipantInviteCapture).toBeFalsy();
        expect(flyoutService.open).toHaveBeenCalledWith(comp.sortFlyout.id);
    });

    it('should call open sort flyout on toggleSortFlyout if closed and set isSortingFlyoutOpen to true', () => {
        spyOn(flyoutService, 'open').and.callThrough();

        comp.isSortingFlyoutOpen = false;

        comp.toggleSortFlyout();

        expect(comp.isSortingFlyoutOpen).toBeTruthy();
        expect(flyoutService.open).toHaveBeenCalledWith(comp.sortFlyout.id);
    });

    it('should call close sort flyout on toggleSortFlyout', () => {
        spyOn(flyoutService, 'close').and.callThrough();

        comp.isSortingFlyoutOpen = true;

        comp.toggleSortFlyout();

        expect(flyoutService.close).toHaveBeenCalledWith(comp.sortFlyout.id);
    });

    it('should set isSortingFlyoutOpen to false on flyout closeEvents if ID matches the sort flyout ID', () => {
        comp.isSortingFlyoutOpen = true;

        flyoutService.closeEvents.next(comp.sortFlyout.id);

        expect(comp.isSortingFlyoutOpen).toBeFalsy();
    });

    it('should not set isSortingFlyoutOpen to false on flyout closeEvents if ID does not matches the sort flyout ID', () => {
        comp.isSortingFlyoutOpen = true;

        flyoutService.closeEvents.next('foo');

        expect(comp.isSortingFlyoutOpen).toBeTruthy();
    });

    it('should call setFocus on toggleInviteParticipantCapture if participant invite capture is not visible', () => {
        comp.showParticipantInviteCapture = false;

        spyOn(comp.participantInviteCapture, 'setFocus').and.callThrough();

        comp.toggleInviteParticipantCapture();

        expect(comp.participantInviteCapture.setFocus).toHaveBeenCalled();
    });

    it('should call handleCancel on toggleInviteParticipantCapture if participant invite capture is visible', () => {
        comp.showParticipantInviteCapture = true;

        spyOn(comp.participantInviteCapture, 'handleCancel').and.callThrough();

        comp.toggleInviteParticipantCapture();

        expect(comp.participantInviteCapture.handleCancel).toHaveBeenCalled();
    });

    it('should set showParticipantInviteCapture to false on closeInviteParticipantCapture', () => {
        comp.showParticipantInviteCapture = true;
        comp.closeInviteParticipantCapture();
        expect(comp.showParticipantInviteCapture).toBeFalsy();
    });

    it('should dispatch ProjectParticipantActions.Set.ListFilters with the correct payload on ngOnInit', () => {
        const expectedResult = new ProjectParticipantActions.Set.ListFilters({status: allParticipantsStatus});

        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.ngOnInit();

        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch ProjectParticipantActions.Set.ListFilters with the correct payload when handleToolbarFilterChange ' +
        'is called with all option', () => {
        const option = comp.toolbarFilterOptions.find(item => item.id === ParticipantToolbarFilterEnum.ALL);
        const expectedResult = new ProjectParticipantActions.Set.ListFilters({status: allParticipantsStatus});

        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.handleToolbarFilterChange(option);

        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch ProjectParticipantActions.Set.ListFilters with the correct payload when handleToolbarFilterChange ' +
        'is called with active option', () => {
        const option = comp.toolbarFilterOptions.find(item => item.id === ParticipantToolbarFilterEnum.ACTIVE);
        const expectedResult = new ProjectParticipantActions.Set.ListFilters({status: activeParticipantsStatus});

        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.handleToolbarFilterChange(option);

        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch ProjectParticipantActions.Set.ListFilters with the correct payload when handleToolbarFilterChange ' +
        'is called with pending option', () => {
        const option = comp.toolbarFilterOptions.find(item => item.id === ParticipantToolbarFilterEnum.PENDING);
        const expectedResult = new ProjectParticipantActions.Set.ListFilters({status: pendingParticipantsStatus});

        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.handleToolbarFilterChange(option);

        expect(mockedStore.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
