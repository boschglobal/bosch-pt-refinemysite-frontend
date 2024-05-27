/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';
import {
    first,
    take
} from 'rxjs/operators';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_CREATE_PROJECT_CRAFT,
    MOCK_POST_CRAFT_SUCCESS_ALERT_PAYLOAD,
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_LIST,
    MOCK_SAVE_PROJECT_CRAFT
} from '../../../../../test/mocks/crafts';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectCraftService} from '../../api/crafts/project-craft.service';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListResource} from '../../api/crafts/resources/project-craft-list.resource';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ProjectCraftActions,
    UpdateProjectCraftPayload,
} from './project-craft.actions';
import {ProjectCraftEffects} from './project-craft.effects';
import {ProjectCraftQueries} from './project-craft.queries';

describe('Project Craft Effects', () => {
    let projectCraftEffects: ProjectCraftEffects;
    let projectCraftService: jasmine.SpyObj<ProjectCraftService>;
    let actions: ReplaySubject<any>;

    const testDataItemId = 'c575e002-5305-4d7a-bc16-2aa88a991ca3';
    const projectCraftResponse: Observable<ProjectCraftResource> = of(MOCK_PROJECT_CRAFT_A);
    const getProjectCraftsResponse: Observable<ProjectCraftListResource> = of(MOCK_PROJECT_CRAFT_LIST);
    const errorResponse: Observable<any> = throwError('error');

    const projectCraftQueries: ProjectCraftQueries = mock(ProjectCraftQueries);
    const projectSliceService: ProjectSliceService = mock(ProjectSliceService);

    const MOCK_UPDATE_PROJECT_CRAFT: UpdateProjectCraftPayload = {
        saveProjectCraft: MOCK_CREATE_PROJECT_CRAFT,
        projectCraftId: '1234',
        craftVersion: 0,
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectCraftEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectCraftService,
                useValue: jasmine.createSpyObj('ProjectCraftService', ['findAll', 'create', 'update', 'delete', 'updateList']),
            },
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceService),
            },
            {
                provide: ProjectCraftQueries,
                useValue: instance(projectCraftQueries),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(projectSliceService.observeCurrentProjectId()).thenReturn(of(testDataItemId));
        when(projectCraftQueries.observeCraftById(anything())).thenReturn(of(MOCK_PROJECT_CRAFT_A));
        when(projectCraftQueries.observeListVersion()).thenReturn(of(0));

        projectCraftEffects = TestBed.inject(ProjectCraftEffects);
        projectCraftService = TestBed.inject(ProjectCraftService) as jasmine.SpyObj<ProjectCraftService>;
        actions = new ReplaySubject(1);
    });

    it('should trigger a ProjectCraftActions.Request.AllFulfilled after requesting all crafts successfully', (done) => {
        const expectedResult = new ProjectCraftActions.Request.AllFulfilled(MOCK_PROJECT_CRAFT_LIST);

        projectCraftService.findAll.and.returnValue(getProjectCraftsResponse);
        actions.next(new ProjectCraftActions.Request.All());
        projectCraftEffects.requestAllCrafts$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Request.AllRejected after requesting all crafts unsuccessfully', (done) => {
        const expectedResult = new ProjectCraftActions.Request.AllRejected();

        projectCraftService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectCraftActions.Request.All());
        projectCraftEffects.requestAllCrafts$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Create.OneFulfilled after creating a craft successfully', (done) => {
        const expectedResult = new ProjectCraftActions.Create.OneFulfilled(MOCK_PROJECT_CRAFT_LIST);

        projectCraftService.create.and.returnValue(getProjectCraftsResponse);
        actions.next(new ProjectCraftActions.Create.One(MOCK_SAVE_PROJECT_CRAFT));
        projectCraftEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Create.OneRejected after creating a craft unsuccessfully', (done) => {
        const expectedResult = new ProjectCraftActions.Create.OneRejected();

        projectCraftService.create.and.returnValue(errorResponse);
        actions.next(new ProjectCraftActions.Create.One(MOCK_CREATE_PROJECT_CRAFT));
        projectCraftEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Update.OneFulfilled after updating a craft successfully', (done) => {
        const expectedResult = new ProjectCraftActions.Update.OneFulfilled(MOCK_PROJECT_CRAFT_A);

        projectCraftService.update.and.returnValue(projectCraftResponse);
        actions.next(new ProjectCraftActions.Update.One(MOCK_UPDATE_PROJECT_CRAFT));
        projectCraftEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Update.OneRejected after updating a craft unsuccessfully', (done) => {
        const expectedResult = new ProjectCraftActions.Update.OneRejected();

        projectCraftService.update.and.returnValue(errorResponse);
        actions.next(new ProjectCraftActions.Update.One(MOCK_UPDATE_PROJECT_CRAFT));
        projectCraftEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Create.OneReset and AlertActions.Add.SuccessAlert action' +
        ' after a ProjectCraftActions.Create.OneFulfilled action is triggered', (done) => {
        const expectedResult = [
            new ProjectCraftActions.Create.OneReset(),
            new AlertActions.Add.SuccessAlert(MOCK_POST_CRAFT_SUCCESS_ALERT_PAYLOAD),
        ];
        const resultFromEffects = [];

        actions.next(new ProjectCraftActions.Create.OneFulfilled(MOCK_PROJECT_CRAFT_LIST));
        projectCraftEffects.createSuccess$.subscribe(result => {
            resultFromEffects.push(result);
        });
        expect(resultFromEffects[0].type).toBe(expectedResult[0].type);
        expect(resultFromEffects[1].type).toBe(expectedResult[1].type);
        done();
    });

    it('should trigger a ProjectCraftActions.Update.OneReset and AlertActions.Add.SuccessAlert action' +
        ' after a ProjectCraftActions.Update.OneFulfilled action is triggered', (done) => {
        const expectedResult = [
            new ProjectCraftActions.Update.OneReset(),
            new AlertActions.Add.SuccessAlert(MOCK_POST_CRAFT_SUCCESS_ALERT_PAYLOAD),
        ];
        const resultFromEffects = [];

        actions.next(new ProjectCraftActions.Update.OneFulfilled(MOCK_PROJECT_CRAFT_A));
        projectCraftEffects.updateSuccess$.subscribe(result => {
            resultFromEffects.push(result);
        });
        expect(resultFromEffects[0].type).toBe(expectedResult[0].type);
        expect(resultFromEffects[1].type).toBe(expectedResult[1].type);
        done();
    });

    it('should trigger a ProjectCraftActions.Delete.OneFulfilled after deleting a craft successfully', (done) => {
        const expectedResult = new ProjectCraftActions.Delete.OneFulfilled(MOCK_PROJECT_CRAFT_LIST);

        projectCraftService.delete.and.returnValue(getProjectCraftsResponse);
        actions.next(new ProjectCraftActions.Delete.One(MOCK_PROJECT_CRAFT_A.id));
        projectCraftEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Delete.OneRejected after deleting a craft unsuccessfully', (done) => {
        const expectedResult = new ProjectCraftActions.Delete.OneRejected();

        projectCraftService.delete.and.returnValue(errorResponse);
        actions.next(new ProjectCraftActions.Delete.One(testDataItemId));
        projectCraftEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectCraftActions.Delete.OneFulfilled action is triggered',
        (done) => {
            const key = 'Craft_Delete_SuccessMessage';
            const expectedResult = new AlertActions.Add.SuccessAlert({
                message: {
                    key,
                },
            });

            actions.next(new ProjectCraftActions.Delete.OneFulfilled(MOCK_PROJECT_CRAFT_LIST));
            projectCraftEffects.deleteSuccess$
                .pipe(first())
                .subscribe((result: AlertActions.Add.SuccessAlert) => {
                    expect(result.type).toEqual(expectedResult.type);
                    expect(result.payload.type).toBe(expectedResult.payload.type);
                    expect(result.payload.message).toEqual(expectedResult.payload.message);
                    done();
                });
        });

    it('should trigger a ProjectCraftActions.Update.ListFulfilled after updating craft list successfully', (done) => {
        const expectedResult = new ProjectCraftActions.Update.ListFulfilled(MOCK_PROJECT_CRAFT_LIST);

        projectCraftService.updateList.and.returnValue(getProjectCraftsResponse);
        actions.next(new ProjectCraftActions.Update.List(MOCK_UPDATE_PROJECT_CRAFT));
        projectCraftEffects.updateList$.pipe(take(1)).subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Update.ListRejected after updating craft list unsuccessfully', (done) => {
        const expectedResult = new ProjectCraftActions.Update.ListRejected();

        projectCraftService.updateList.and.returnValue(errorResponse);
        actions.next(new ProjectCraftActions.Update.List(MOCK_UPDATE_PROJECT_CRAFT));
        projectCraftEffects.updateList$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Request.All after update list has failed', (done) => {
        const expectedResult = new ProjectCraftActions.Request.All();

        actions.next(new ProjectCraftActions.Update.ListRejected());
        projectCraftEffects.triggerRequestProjectCraftsActions$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Create.OneReset' +
        ' action after a ProjectCraftActions.Create.OneFulfilled action is triggered', (done) => {
        const expectedResult = new ProjectCraftActions.Create.OneReset();

        actions.next(new ProjectCraftActions.Create.OneFulfilled(MOCK_PROJECT_CRAFT_LIST));
        projectCraftEffects.createSuccess$.pipe(take(1)).subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            done();
        });
    });

    it('should trigger a ProjectCraftActions.Update.OneReset' +
        ' action after a ProjectCraftActions.Update.OneFulfilled action is triggered', (done) => {
        const expectedResult = new ProjectCraftActions.Update.OneReset();

        actions.next(new ProjectCraftActions.Update.OneFulfilled(MOCK_PROJECT_CRAFT_A));
        projectCraftEffects.updateSuccess$.pipe(take(1)).subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            done();
        });
    });
});
