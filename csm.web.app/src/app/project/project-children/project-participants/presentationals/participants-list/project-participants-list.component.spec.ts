/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router,
    RouterModule
} from '@angular/router';
import {cloneDeep} from 'lodash';
import {of} from 'rxjs';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_4,
    MOCK_PARTICIPANTS
} from '../../../../../../test/mocks/participants';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectParticipantsListRowModel} from '../../containers/participants-content/project-participants-content.model';
import {ProjectParticipantsListComponent} from './project-participants-list.component';

describe('Project Participants List Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsListComponent>;
    let comp: ProjectParticipantsListComponent;
    let de: DebugElement;
    let activeParticipants: ProjectParticipantsListRowModel[];
    let nonActiveParticipants: ProjectParticipantsListRowModel[];

    const dataAutomationTaskDetailButton = '[data-automation="participant-detail-button"]';
    const dataAutomationCollapsibleListArrow = '[data-automation^="ss-collapsible-list-arrow"]';
    const dataAutomationActionsDropdownButton = '[data-automation^="ss-project-participants-list-actions"]';
    const participantListActionsPlaceholderClass = 'ss-project-participants-list__actions-placeholder';
    const clickEvent: Event = new Event('click');
    const resizeEvent: Event = new Event('resize');
    const initialInnerWidth: number = window.innerWidth;
    const linksWithoutActions = {self: {href: '1'}};
    const linksWithActions = {
        self: {href: '1'},
        update: {href: '2'},
        delete: {href: '3'},
        resend: {href: '4'},
    };
    const participantWithActions = Object.assign({}, cloneDeep(MOCK_PARTICIPANT), {_links: linksWithActions});
    const participantWithoutActions = Object.assign({}, cloneDeep(MOCK_PARTICIPANT), {_links: linksWithoutActions});

    const getParticipantPrimaryCompany = (id: string) =>
        de.query(By.css(`[data-automation=project-participants-list-primary-company-${id}]`))
            ?.query(By.css('ss-card-company'));

    const getParticipantPrimaryEmail = (id: string) =>
        de.query(By.css(`[data-automation=project-participants-list-primary-email-${id}]`))
            ?.query(By.css('ss-mail-link'));

    function createParticipantRowModel(participant: ProjectParticipantResource): ProjectParticipantsListRowModel {
        return ProjectParticipantsListRowModel.fromResource(participant);
    }

    function updateWindowInnerWidth(width: number): void {
        Object.defineProperty(window, 'innerWidth', {
            get: () => width,
        });

        window.dispatchEvent(resizeEvent);
    }

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
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: ROUTE_PARAM_PROJECT_ID,
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
                provide: Router,
                useValue: RouterModule,
            },
        ],
        declarations: [ProjectParticipantsListComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.participants = MOCK_PARTICIPANTS.map(participant => createParticipantRowModel(participant));
        comp.isLoading = false;

        activeParticipants = comp.participants.filter(participant => participant.status === ParticipantStatusEnum.ACTIVE);
        nonActiveParticipants = comp.participants.filter(participant => participant.status !== ParticipantStatusEnum.ACTIVE);

        updateWindowInnerWidth(500);
        fixture.detectChanges();
    });

    afterAll(() => updateWindowInnerWidth(initialInnerWidth));

    it('should output emit onClickTask() when clicking Detail Button', () => {
        spyOn(comp.onClickDetails, 'emit').and.callThrough();
        const collapsibleListArrowElement = de.query(By.css(dataAutomationCollapsibleListArrow)).nativeElement;
        collapsibleListArrowElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        const taskDetailButtonElement = de.query(By.css(dataAutomationTaskDetailButton)).nativeElement;
        taskDetailButtonElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onClickDetails.emit).toHaveBeenCalled();
    });

    it('should emit event only when participant status is ACTIVE', () => {
        const spy = spyOn(comp.onClickDetails, 'emit').and.callThrough();

        comp.onClickDetailsParticipant(createParticipantRowModel(MOCK_PARTICIPANT));
        expect(comp.onClickDetails.emit).toHaveBeenCalledTimes(1);

        spy.calls.reset();

        comp.onClickDetailsParticipant(createParticipantRowModel(MOCK_PARTICIPANT_4));
        expect(comp.onClickDetails.emit).not.toHaveBeenCalled();
    });

    it('should return true if participant is ACTIVE', () => {
        const result = comp.isActiveParticipant(createParticipantRowModel(MOCK_PARTICIPANT));
        expect(result).toBeTruthy();

        const result2 = comp.isActiveParticipant(createParticipantRowModel(MOCK_PARTICIPANT_4));
        expect(result2).toBeFalsy();
    });

    it('should display company card in primary template only for active participants', () => {
        activeParticipants.forEach(participant => {
            expect(getParticipantPrimaryCompany(participant.id)).toBeDefined();
        });

        nonActiveParticipants.forEach(participant => {
            expect(getParticipantPrimaryCompany(participant.id)).toBeUndefined();
        });
    });

    it('should display email link in primary template only for non active participants', () => {
        nonActiveParticipants.forEach(participant => {
            expect(getParticipantPrimaryEmail(participant.id)).toBeDefined();
        });

        activeParticipants.forEach(participant => {
            expect(getParticipantPrimaryEmail(participant.id)).toBeUndefined();
        });
    });

    it('should add specific CSS class when participant does not have actions but some other participants do', () => {
        const participants = [participantWithoutActions, participantWithActions];

        comp.participants = participants.map(participant => createParticipantRowModel(participant));

        fixture.detectChanges();

        expect(de.queryAll(By.css(dataAutomationActionsDropdownButton))[0].nativeElement.classList)
            .toContain(participantListActionsPlaceholderClass);
        expect(de.queryAll(By.css(dataAutomationActionsDropdownButton))[1].nativeElement.classList)
            .not.toContain(participantListActionsPlaceholderClass);
    });

    it('should not add specific CSS class when all participants do not have actions', () => {
        const participants = [participantWithoutActions, participantWithoutActions, participantWithoutActions];

        comp.participants = participants.map(participant => createParticipantRowModel(participant));

        fixture.detectChanges();

        comp.participants.forEach((participant: ProjectParticipantsListRowModel, index: number) =>
            expect(de.queryAll(By.css(dataAutomationActionsDropdownButton))[index].nativeElement.classList)
                .not.toContain(participantListActionsPlaceholderClass));
    });

    it('should emit actionClicked when handleDropdownItemClicked is called', () => {
        const item: MenuItem = {
            id: 'foo',
            label: 'foo',
            type: 'button',
        };

        spyOn(comp.actionClicked, 'emit');

        comp.handleDropdownItemClicked(item);

        expect(comp.actionClicked.emit).toHaveBeenCalledWith(item);
    });
});
