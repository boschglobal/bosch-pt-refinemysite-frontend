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
import {By} from '@angular/platform-browser';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2
} from '../../../../../test/mocks/participants';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectCardContactComponent} from './project-card-contact.component';

describe('Project Card Contact Component', () => {
    let fixture: ComponentFixture<ProjectCardContactComponent>;
    let comp: ProjectCardContactComponent;
    let de: DebugElement;

    const mockContacts: ProjectParticipantResource[] = [
        MOCK_PARTICIPANT,
        MOCK_PARTICIPANT_2
    ];

    const dataAutomationProjectCardUser = `[data-automation="project-card-user"]`;

    const getUserCards = () => de.queryAll(By.css(dataAutomationProjectCardUser));
    const getUserCardsCount = () => getUserCards().length;
    const getUserCard = (index: number) => getUserCards()[index].nativeElement;

    const eventClick: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            ProjectCardContactComponent
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCardContactComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.contacts = mockContacts;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should have the correct user cards', () => {
        expect(getUserCardsCount()).toBe(mockContacts.length);
    });

    it('should track contacts by id', () => {
        expect(comp.trackContact(0, mockContacts[0])).toBe(mockContacts[0].id);
    });

    it('should should emit event with contact when clicked', () => {
        spyOn(comp.contactClicked, 'emit').and.callThrough();
        getUserCard(0).dispatchEvent(eventClick);
        expect(comp.contactClicked.emit).toHaveBeenCalledWith(mockContacts[0]);
    });
});
