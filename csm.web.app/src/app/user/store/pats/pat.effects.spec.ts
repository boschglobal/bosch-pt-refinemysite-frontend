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
import {first} from 'rxjs/operators';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {getExpectedAlertAction} from '../../../../test/helpers';
import {
    MOCK_PAT_LIST_RESOURCE,
    MOCK_PAT_RESOURCE,
    MOCK_SAVE_PAT_RESOURCE
} from '../../../../test/mocks/pat';
import {MockStore} from '../../../../test/mocks/store';
import {PATService} from '../../../project/project-common/api/pats/pat.service';
import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListResource} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {AlertActions} from '../../../shared/alert/store/alert.actions';
import {
    PATActions,
    UpdatePATPayload
} from './pat.actions';
import {PATEffects} from './pat.effects';
import {PATQueries} from './pat.queries';

describe('PAT Effects', () => {
    let patEffects: PATEffects;
    let patService: jasmine.SpyObj<PATService>;
    let actions: ReplaySubject<PATActions>;

    const testDataItemId = 'c575e002-5305-4d7a-bc16-2aa88a991ca3';
    const patResponse: Observable<PATResource> = of(MOCK_PAT_RESOURCE);
    const getPATsResponse: Observable<PATListResource> = of(MOCK_PAT_LIST_RESOURCE);
    const errorResponse: Observable<never> = throwError('error');

    const patQueries: PATQueries = mock(PATQueries);

    const MOCK_UPDATE_PROJECT_PAT: UpdatePATPayload = {
        savePATResource: MOCK_SAVE_PAT_RESOURCE,
        patId: '1234',
        version: 0,
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            PATEffects,
            provideMockActions(() => actions),
            {
                provide: PATService,
                useValue: jasmine.createSpyObj('PATService', ['findAll', 'create', 'update', 'delete']),
            },
            {
                provide: PATQueries,
                useValue: instance(patQueries),
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
        when(patQueries.observePATById(anything())).thenReturn(patResponse);

        patEffects = TestBed.inject(PATEffects);
        patService = TestBed.inject(PATService) as jasmine.SpyObj<PATService>;
        actions = new ReplaySubject(1);
    });

    it('should trigger a PATActions.Request.AllFulfilled after requesting all pats successfully', (done) => {
        const expectedResult = new PATActions.Request.AllFulfilled(MOCK_PAT_LIST_RESOURCE);

        patService.findAll.and.returnValue(getPATsResponse);
        actions.next(new PATActions.Request.All());
        patEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Request.AllRejected after requesting all pats unsuccessfully', (done) => {
        const expectedResult = new PATActions.Request.AllRejected();

        patService.findAll.and.returnValue(errorResponse);
        actions.next(new PATActions.Request.All());
        patEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Create.OneFulfilled after creating a pat successfully', (done) => {
        const expectedResult = new PATActions.Create.OneFulfilled(MOCK_PAT_RESOURCE);

        patService.create.and.returnValue(patResponse);
        actions.next(new PATActions.Create.One(MOCK_SAVE_PAT_RESOURCE));
        patEffects.createOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Create.OneRejected after creating a pat unsuccessfully', (done) => {
        const expectedResult = new PATActions.Create.OneRejected();

        patService.create.and.returnValue(errorResponse);
        actions.next(new PATActions.Create.One(MOCK_SAVE_PAT_RESOURCE));
        patEffects.createOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Update.OneFulfilled after updating a pat successfully', (done) => {
        const expectedResult = new PATActions.Update.OneFulfilled(MOCK_PAT_RESOURCE);

        patService.update.and.returnValue(patResponse);
        actions.next(new PATActions.Update.One(MOCK_UPDATE_PROJECT_PAT));
        patEffects.updateOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Update.OneRejected after updating a pat unsuccessfully', (done) => {
        const expectedResult = new PATActions.Update.OneRejected();

        patService.update.and.returnValue(errorResponse);
        actions.next(new PATActions.Update.One(MOCK_UPDATE_PROJECT_PAT));
        patEffects.updateOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Delete.OneFulfilled after deleting a pat successfully', (done) => {
        const expectedResult = new PATActions.Delete.OneFulfilled("foo");

        patService.delete.and.returnValue(getPATsResponse);
        actions.next(new PATActions.Delete.One(MOCK_PAT_RESOURCE.id));
        patEffects.deleteOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a PATActions.Delete.OneRejected after deleting a pat unsuccessfully', (done) => {
        const expectedResult = new PATActions.Delete.OneRejected();

        patService.delete.and.returnValue(errorResponse);
        actions.next(new PATActions.Delete.One(testDataItemId));
        patEffects.deleteOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a PATActions.Create.OneFulfilled action is triggered',
        (done) => {
            const key = 'PAT_Create_SuccessMessage';
            const expectedResult = getExpectedAlertAction(new AlertActions.Add.SuccessAlert({
                message: {
                    key,
                },
            }));

            actions.next(new PATActions.Create.OneFulfilled(MOCK_PAT_RESOURCE));
            patEffects.createOneSuccess$
                .pipe(first())
                .subscribe((result) => {
                    expect(result).toEqual(expectedResult);
                    done();
                });
        });

    it('should trigger a AlertActions.Add.SuccessAlert action after a PATActions.Update.OneFulfilled action is triggered',
        (done) => {
            const key = 'PAT_Update_SuccessMessage';
            const expectedResult = getExpectedAlertAction(new AlertActions.Add.SuccessAlert({
                message: {
                    key,
                },
            }));

            actions.next(new PATActions.Update.OneFulfilled(MOCK_PAT_RESOURCE));
            patEffects.updateOneSuccess$
                .pipe(first())
                .subscribe((result) => {
                    expect(result).toEqual(expectedResult);
                    done();
                });
        });

    it('should trigger a AlertActions.Add.SuccessAlert action after a PATActions.Delete.OneFulfilled action is triggered',
        (done) => {
            const key = 'PAT_Delete_SuccessMessage';
            const expectedResult = getExpectedAlertAction(new AlertActions.Add.SuccessAlert({
                message: {
                    key,
                },
            }));

            actions.next(new PATActions.Delete.OneFulfilled("foo"));
            patEffects.deleteOneSuccess$
                .pipe(first())
                .subscribe((result) => {
                    expect(result).toEqual(expectedResult);
                    done();
                });
        });
});
