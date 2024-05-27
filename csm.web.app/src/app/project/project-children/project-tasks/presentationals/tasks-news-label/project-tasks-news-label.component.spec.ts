/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {IconModule} from '../../../../../shared/ui/icons/icon.module';
import {ProjectTasksNewsLabelComponent} from './project-tasks-news-label.component';

describe('Project Task News Label Component', () => {
    let fixture: ComponentFixture<ProjectTasksNewsLabelComponent>;
    let comp: ProjectTasksNewsLabelComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const criticalTopics = 5;
    const uncriticalTopics = 10;
    const noTopics = 0;

    const dataAutomationUncriticalLabelSelector = '[data-automation="project-task-news-label-uncritical"]';
    const dataAutomationCriticalLabelSelector = '[data-automation="project-task-news-label-critical"]';

    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
        ],
        declarations: [ProjectTasksNewsLabelComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksNewsLabelComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should render both critical and uncritical topics', () => {
        comp.news = {
            uncriticalTopics,
            criticalTopics,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalLabelSelector)).toBeDefined();
        expect(getElement(dataAutomationUncriticalLabelSelector)).toBeDefined();
    });

    it('should not render critical or uncritical topics', () => {
        comp.news = {
            uncriticalTopics: noTopics,
            criticalTopics: noTopics,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalLabelSelector)).toBeNull();
        expect(getElement(dataAutomationUncriticalLabelSelector)).toBeNull();
    });

    it('should render only critical topics', () => {
        comp.news = {
            uncriticalTopics: noTopics,
            criticalTopics,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalLabelSelector)).toBeDefined();
        expect(getElement(dataAutomationUncriticalLabelSelector)).toBeNull();
    });

    it('should render only uncritical topics', () => {
        comp.news = {
            uncriticalTopics,
            criticalTopics: noTopics,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalLabelSelector)).toBeNull();
        expect(getElement(dataAutomationUncriticalLabelSelector)).toBeDefined();
    });

    it('should get the correct number of critical and uncritical topics', () => {
        comp.news = {
            uncriticalTopics,
            criticalTopics,
        };

        expect(comp.getCriticalTopics).toBe(criticalTopics);
        expect(comp.getUncriticalTopics).toBe(uncriticalTopics);
    });
});
