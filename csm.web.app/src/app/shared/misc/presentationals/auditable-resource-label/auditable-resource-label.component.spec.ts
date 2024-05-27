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
import {TranslateService} from '@ngx-translate/core';
import {lowerFirst} from 'lodash';
import * as moment from 'moment';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {ResourceReference} from '../../api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../api/resources/abstract-auditable.resource';
import {AuditableResourceLabelComponent} from './auditable-resource-label.component';

describe('Auditable Resource Label Component', () => {
    let component: AuditableResourceLabelComponent<AbstractAuditableResource>;
    let fixture: ComponentFixture<AuditableResourceLabelComponent<AbstractAuditableResource>>;
    let el: HTMLElement;
    let de: DebugElement;

    const dataAutomationCreatedDateLabel = '[data-automation="ss-auditable-resource-label-created-label"]';
    const dataAutomationModifiedDateLabel = '[data-automation="ss-auditable-resource-label-modified-label"]';

    const date = new Date();
    const fooResourceReference = new ResourceReference('foo', 'foo');

    const resourceNotModified: AbstractAuditableResource = {
        id: 'foo',
        createdBy: fooResourceReference,
        createdDate: date.toISOString(),
        lastModifiedBy: fooResourceReference,
        lastModifiedDate: date.toISOString(),
    };

    const resourceModified = {
        id: 'foo',
        createdBy: fooResourceReference,
        createdDate: date.toISOString(),
        lastModifiedBy: fooResourceReference,
        lastModifiedDate: moment(date).add(1, 'ms').toISOString(),
    };

    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuditableResourceLabelComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        component.resource = resourceNotModified;

        fixture.detectChanges();
    });

    it('should return date well formatted for end on calendar format', () => {
        const endDate = new Date('2017-10-03T12:47:32Z');
        expect(component.getCalendarTime(endDate).trim()).toBe('10/03/2017');

        expect(component.getCalendarTime(null)).toBeNull();
    });

    it('should display the correct label for created and modified dates', () => {
        const createDateText = lowerFirst(moment(resourceModified.createdDate).locale('en').calendar());
        const modifiedDateText = lowerFirst(moment(resourceModified.lastModifiedDate).locale('en').calendar());
        const expectedCreatedLabel = `Generic_CreatedBy ${resourceModified.createdBy.displayName} ${createDateText}`;
        const expectedModifiedLabel = `Generic_UpdatedBy ${resourceModified.lastModifiedBy.displayName} ${modifiedDateText}`;

        component.resource = resourceModified;

        fixture.detectChanges();

        expect(getElement(dataAutomationCreatedDateLabel).textContent.trim()).toContain(expectedCreatedLabel);
        expect(getElement(dataAutomationModifiedDateLabel).textContent.trim()).toContain(expectedModifiedLabel);
    });

    it('should not render last modified date when resource created date is the same has the modified date', () => {
        component.resource = resourceNotModified;

        fixture.detectChanges();

        expect(getElement(dataAutomationModifiedDateLabel)).toBeNull();
    });

    it('should render last modified date when resource created date is different then modified date', () => {
        component.resource = resourceModified;

        fixture.detectChanges();

        expect(getElement(dataAutomationModifiedDateLabel)).toBeDefined();
    });
});
