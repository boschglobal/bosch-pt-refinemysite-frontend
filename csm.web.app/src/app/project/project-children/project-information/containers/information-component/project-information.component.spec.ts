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
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {of} from 'rxjs';

import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {ProjectSliceServiceMock} from '../../../../../../test/mocks/project-slice.service.mock';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {REDUCER} from '../../../../../app.reducers';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {EmployeeRoleEnum} from '../../../../project-common/enums/employee-role.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectInformationComponent} from './project-information.component';

describe('Project Information Component', () => {
    let fixture: ComponentFixture<ProjectInformationComponent>;
    let comp: ProjectInformationComponent;
    let store: Store<any>;
    let projectParticipantQueries: any;

    const initialState: any = {
        projectSlice: {
            currentItem: {
                id: MOCK_PROJECT_1.id,
                permissions: []
            },
            items: [MOCK_PROJECT_1],
            permissions: []
        },
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            StoreModule.forRoot(REDUCER, initialState),
            TranslationModule.forRoot(),
            EffectsModule.forRoot([]),
            RouterTestingModule,
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123})
                }
            },
            HttpClient,
            ProjectUrlRetriever,
            {
                provide: ProjectSliceService,
                useClass: ProjectSliceServiceMock
            },
            {
                provide: ProjectParticipantQueries,
                useValue: jasmine.createSpyObj('ProjectParticipantQueries', ['observeActiveParticipantsByRole']),
            },
        ],
        declarations: [ProjectInformationComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectInformationComponent);
        store = TestBed.inject<Store<any>>(Store);
        projectParticipantQueries = TestBed.inject<ProjectParticipantQueries>(ProjectParticipantQueries);

        comp = fixture.componentInstance;

        projectParticipantQueries.observeActiveParticipantsByRole.and.returnValue(of([MOCK_PARTICIPANT]));

        fixture.detectChanges();
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should set project property with last state from the store', () => {
        expect(comp.project).toEqual(MOCK_PROJECT_1);
    });

    it('should request participants on component init', () => {
        spyOn(store, 'dispatch').and.callThrough();
        comp.ngOnInit();
        expect(store.dispatch).toHaveBeenCalledWith(new ProjectParticipantActions.Request.ActiveByRole([EmployeeRoleEnum.CSM]));
    });

    it('should observe CSMs from current project', () => {
        expect(comp.contacts).toEqual([MOCK_PARTICIPANT]);
    });

    it('should navigate when contact clicked', () => {
        const expectedURL = ProjectUrlRetriever.getProjectEditUrl(MOCK_PROJECT_1.id);

        expect(comp.projectEditURI).toEqual(expectedURL);
    });
});
