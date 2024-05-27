/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
} from '../../../../../test/mocks/constraints';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ConstraintService} from '../../api/constraints/constraint.service';
import {SaveConstraintResource} from '../../api/constraints/resources/save-constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ConstraintActions} from './constraint.actions';
import {ConstraintEffects} from './constraint.effects';

describe('Constraint Effects', () => {
    let actions: ReplaySubject<any>;
    let constraintEffects: ConstraintEffects;
    let constraintService: any;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const projectId = 'foo';
    const constraintEntityList: ConstraintEntity[] = [
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
    ];

    const errorResponse: Observable<any> = throwError('error');
    const getAllConstraintsEntitiesResponse: Observable<ConstraintEntity[]> = of(constraintEntityList);

    const moduleDef: TestModuleMetadata = {
        providers: [
            ConstraintEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ConstraintService,
                useValue: jasmine.createSpyObj('ConstraintService', [
                    'findAll',
                    'update',
                ]),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

        actions = new ReplaySubject(1);

        constraintEffects = TestBed.inject(ConstraintEffects);
        constraintService = TestBed.inject(ConstraintService);

        constraintService.findAll.calls.reset();
        constraintService.update.calls.reset();
    });

    it('should trigger a ConstraintActions.Request.AllFulfilled after a successful request', () => {
        const expectedResult = new ConstraintActions.Request.AllFulfilled(constraintEntityList);

        constraintService.findAll.and.returnValue(getAllConstraintsEntitiesResponse);
        actions.next(new ConstraintActions.Request.All());
        constraintEffects.requestAll$.subscribe(result => {
            expect(constraintService.findAll).toHaveBeenCalledTimes(1);
            expect(constraintService.findAll).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ConstraintActions.Request.AllRejected after a unsuccessful request', () => {
        const expectedResult = new ConstraintActions.Request.AllRejected();

        constraintService.findAll.and.returnValue(errorResponse);
        actions.next(new ConstraintActions.Request.All());
        constraintEffects.requestAll$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a ConstraintActions.Update.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for a Constraint update request', () => {
        const results: Action[] = [];
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const firstExpectedResult = new ConstraintActions.Update.OneFulfilled(constraint);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Constraint_Updated_SuccessMessage')});

        constraintService.update.and.returnValue(of(constraint));
        actions.next(new ConstraintActions.Update.One(constraintPayload));
        constraintEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as ConstraintActions.Update.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a ConstraintActions.Update.OneRejected after a unsuccessful request for a Constraint update', () => {
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const expectedResult = new ConstraintActions.Update.OneRejected(constraint.key);

        constraintService.update.and.returnValue(errorResponse);
        actions.next(new ConstraintActions.Update.One(constraintPayload));
        constraintEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a ConstraintActions.Activate.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for a Constraint activate request', () => {
        const results: Action[] = [];
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const firstExpectedResult = new ConstraintActions.Activate.OneFulfilled(constraint);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Constraint_Activated_SuccessMessage')});

        constraintService.update.and.returnValue(of(constraint));
        actions.next(new ConstraintActions.Activate.One(constraintPayload));

        constraintEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as ConstraintActions.Activate.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a ConstraintActions.Activate.OneRejected after a unsuccessful request for a Constraint activate', () => {
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const expectedResult = new ConstraintActions.Activate.OneRejected(constraint.key);

        constraintService.update.and.returnValue(errorResponse);
        actions.next(new ConstraintActions.Activate.One(constraintPayload));
        constraintEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a ConstraintActions.Deactivate.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for a Constraint deactivate request', () => {
        const results: Action[] = [];
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const firstExpectedResult = new ConstraintActions.Deactivate.OneFulfilled(constraint);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Constraint_Deactivated_SuccessMessage')});

        constraintService.update.and.returnValue(of(constraint));
        actions.next(new ConstraintActions.Deactivate.One(constraintPayload));

        constraintEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as ConstraintActions.Deactivate.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a ConstraintActions.Deactivate.OneRejected after a unsuccessful request for a Constraint deactivate', () => {
        const constraint = MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY;
        const constraintPayload: SaveConstraintResource = {key: constraint.key, name: constraint.name, active: constraint.active};
        const expectedResult = new ConstraintActions.Deactivate.OneRejected(constraint.key);

        constraintService.update.and.returnValue(errorResponse);
        actions.next(new ConstraintActions.Deactivate.One(constraintPayload));
        constraintEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });
});
