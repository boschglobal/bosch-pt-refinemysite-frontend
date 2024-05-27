/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {UUID} from '../../../../../shared/misc/identification/uuid';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {CollapsibleListComponent} from '../../../../../shared/ui/collapsible-list/collapsible-list.component';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {
    ProjectImportAnalyzeResource,
    ValidationType,
} from '../../../../project-common/api/project-import/resources/project-import-analyze.resource';
import {
    ProjectImportReviewDataComponent,
    ProjectStatistics,
} from './project-import-review-data.component';

describe('ProjectImportReviewDataComponent', () => {
    let component: ProjectImportReviewDataComponent;
    let fixture: ComponentFixture<ProjectImportReviewDataComponent>;
    let translateService: TranslateService;

    const moduleDef: TestModuleMetadata = {
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ProjectImportReviewDataComponent,
            CollapsibleListComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ]};

    const mockResource: ProjectImportAnalyzeResource = {
        id: '17a536b3-5e88-423c-bf48-8f0763668ac4',
        version: 1,
        validationResults: [{
			type: ValidationType.INFO,
			summary: 'Relation type is not supported and will be skipped',
			elements: [
			  'SS: L5 Innenkassette -> Dachabdichtung Blechdach & Provisorien',
			  'FF: WDVS -> Unterdecke mit Einbauten',
			],
		},
        {
            type: ValidationType.INFO,
            summary: 'Relation type is not supported and will be skipped',
            elements: [],
        },
		{
			type: ValidationType.ERROR,
			summary: 'Milestone name will be shortened',
			elements: [
			  'Original name -> New name',
			  '...',
			],
		}],
        statistics: {
            workAreas: 0,
            crafts: 2,
            tasks: 1,
            milestones: 0,
            relations: 0,
        },
    };

    const mockRecords: ProjectStatistics[] = [
        {
            id: 'mockId',
            isNew: true,
            state: 'success',
            summary: 'mockTranslation',
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'success',
            summary: 'mockTranslation',
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'success',
            summary: 'mockTranslation',
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'success',
            summary: 'mockTranslation',
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'success',
            summary: 'mockTranslation',
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'warning',
            summary: 'Relation type is not supported and will be skipped',
            elements: [
                'SS: L5 Innenkassette -> Dachabdichtung Blechdach & Provisorien',
                'FF: WDVS -> Unterdecke mit Einbauten',
            ],
            notCollapsible: false,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'warning',
            summary: 'Relation type is not supported and will be skipped',
            elements: [],
            notCollapsible: true,
        },
        {
            id: 'mockId',
            isNew: true,
            state: 'error',
            summary: 'Milestone name will be shortened',
            elements: [
                'Original name -> New name',
                '...',
            ],
            notCollapsible: false,
        },
    ];

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportReviewDataComponent);
        component = fixture.componentInstance;
        component.resource = mockResource;
        translateService = TestBed.inject(TranslateService);

        spyOn(translateService, 'instant').and.returnValue('mockTranslation');
        spyOn(UUID, 'v4').and.returnValue('mockId');

        fixture.detectChanges();
        component.ngOnInit();
    });

    describe('#ngOnInit', () => {
        it('should call _createListEntries, and set records', () => {
            expect(component.records).toEqual(mockRecords);
        });

        it('should set notCollapsible true for validationResults with no entries', () => {
            expect(component.records[6].notCollapsible).toBeTruthy();
        });
    });
});
