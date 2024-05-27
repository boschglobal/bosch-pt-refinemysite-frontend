/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {take} from 'rxjs/operators';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_SAVE_WORKAREA,
    MOCK_UPDATE_WORKAREA,
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREAS_LIST
} from '../../../../../test/mocks/workareas';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaListResource} from '../../api/workareas/resources/workarea-list.resource';
import {WorkareaService} from '../../api/workareas/workarea.service';
import {WorkareaActions} from './workarea.actions';
import {WorkareaEffects} from './workarea.effects';

describe('Workarea Effects', () => {
    let workareaEffects: WorkareaEffects;
    let workareaService: any;
    let actions: ReplaySubject<any>;

    const getWorkareasResponse: Observable<WorkareaListResource> = of(MOCK_WORKAREAS_LIST);
    const updateWorkareaResponse: Observable<WorkareaResource> = of(MOCK_WORKAREA_A);
    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            WorkareaEffects,
            provideMockActions(() => actions),
            {
                provide: WorkareaService,
                useValue: jasmine.createSpyObj('WorkareaService', ['findAll', 'create', 'delete', 'update', 'updateList'])
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
                                }
                            },
                            workareaSlice: {
                                currentItem: {
                                    id: MOCK_WORKAREA_A.id,
                                    requestStatus: RequestStatusEnum.success,
                                },
                                items: [MOCK_WORKAREA_A, MOCK_WORKAREA_B],
                                list: {
                                    ids: [MOCK_WORKAREA_A.id, MOCK_WORKAREA_B.id],
                                    requestStatus: RequestStatusEnum.success,
                                    _links: {
                                        create: {
                                            href: ''
                                        }
                                    }
                                }
                            }
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        workareaEffects = TestBed.inject(WorkareaEffects);
        workareaService = TestBed.inject(WorkareaService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a WorkareaActions.Request.AllFulfilled', function () {
        const expectedResult = new WorkareaActions.Request.AllFulfilled(MOCK_WORKAREAS_LIST);

        workareaService.findAll.and.returnValue(getWorkareasResponse);
        actions.next(new WorkareaActions.Request.All());
        workareaEffects.requestAllWorkareas$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Request.AllRejected', function () {
        const expectedResult = new WorkareaActions.Request.AllRejected();

        workareaService.findAll.and.returnValue(errorResponse);
        actions.next(new WorkareaActions.Request.All());
        workareaEffects.requestAllWorkareas$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Create.OneFulfilled', function () {
        const expectedResult = new WorkareaActions.Create.OneFulfilled(MOCK_WORKAREAS_LIST);

        workareaService.create.and.returnValue(getWorkareasResponse);
        actions.next(new WorkareaActions.Create.One(MOCK_SAVE_WORKAREA));
        workareaEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Create.OneRejected', function () {
        const expectedResult = new WorkareaActions.Create.OneRejected();

        workareaService.create.and.returnValue(errorResponse);
        actions.next(new WorkareaActions.Create.One(MOCK_SAVE_WORKAREA));
        workareaEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Update.OneFulfilled', function () {
        const expectedResult = new WorkareaActions.Update.OneFulfilled(MOCK_WORKAREA_A);

        workareaService.update.and.returnValue(updateWorkareaResponse);
        actions.next(new WorkareaActions.Update.One(MOCK_UPDATE_WORKAREA));
        workareaEffects.update$.pipe(take(1)).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Update.OneRejected', function () {
        const expectedResult = new WorkareaActions.Update.OneRejected();

        workareaService.update.and.returnValue(errorResponse);
        actions.next(new WorkareaActions.Update.One(MOCK_UPDATE_WORKAREA));
        workareaEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Update.ListFulfilled', function () {
        const expectedResult = new WorkareaActions.Update.ListFulfilled(MOCK_WORKAREAS_LIST);

        workareaService.updateList.and.returnValue(getWorkareasResponse);
        actions.next(new WorkareaActions.Update.List(MOCK_UPDATE_WORKAREA));
        workareaEffects.updateList$.pipe(take(1)).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Update.ListRejected', function () {
        const expectedResult = new WorkareaActions.Update.ListRejected();

        workareaService.updateList.and.returnValue(errorResponse);
        actions.next(new WorkareaActions.Update.List(MOCK_UPDATE_WORKAREA));
        workareaEffects.updateList$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Request.All after update list has failed', function () {
        const expectedResult = new WorkareaActions.Request.All();

        actions.next(new WorkareaActions.Update.ListRejected());
        workareaEffects.triggerRequestWorkareasActions$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Update.OneReset action after a WorkareaActions.Create.OneFulfilled action is triggered', () => {
        const expectedResult = new WorkareaActions.Update.OneReset();

        actions.next(new WorkareaActions.Create.OneFulfilled(MOCK_WORKAREAS_LIST));
        workareaEffects.createOrUpdateSuccess$.pipe(take(1)).subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a WorkareaActions.Create.OneFulfilled action is triggered', () => {
        const key = 'Workarea_Create_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new WorkareaActions.Create.OneFulfilled(MOCK_WORKAREAS_LIST));
        workareaEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toEqual(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a WorkareaActions.Update.OneReset action after a WorkareaActions.Update.OneFulfilled action is triggered', () => {
        const expectedResult = new WorkareaActions.Update.OneReset();

        actions.next(new WorkareaActions.Update.OneFulfilled(MOCK_WORKAREA_A));
        workareaEffects.createOrUpdateSuccess$.pipe(take(1)).subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a WorkareaActions.Update.OneFulfilled action is triggered', () => {
        const key = 'Workarea_Update_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new WorkareaActions.Update.OneFulfilled(MOCK_WORKAREA_A));
        workareaEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toEqual(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a WorkareaActions.Delete.OneFulfilled action', () => {
        const expectedResult = new WorkareaActions.Delete.OneFulfilled(MOCK_WORKAREAS_LIST);

        workareaService.delete.and.returnValue(getWorkareasResponse);
        actions.next(new WorkareaActions.Delete.One(MOCK_WORKAREA_A.id));
        workareaEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a WorkareaActions.Delete.OneRejected', () => {
        const expectedResult = new WorkareaActions.Delete.OneRejected();

        workareaService.delete.and.returnValue(errorResponse);
        actions.next(new WorkareaActions.Delete.One(MOCK_WORKAREA_A.id));
        workareaEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a WorkareaActions.Delete.OneFulfilled action is triggered', () => {
        const key = 'Workarea_Delete_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new WorkareaActions.Delete.OneFulfilled(MOCK_WORKAREAS_LIST));
        workareaEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toEqual(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });
});
