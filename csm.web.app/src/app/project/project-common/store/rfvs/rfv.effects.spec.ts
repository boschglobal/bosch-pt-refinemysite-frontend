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
    throwError
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../test/mocks/rfvs';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {FeatureToggleHelper} from '../../../../shared/misc/helpers/feature-toggle.helper';
import {SaveRfvResource} from '../../api/rfvs/resources/save-rfv.resource';
import {RfvService} from '../../api/rfvs/rfv.service';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {ProjectSliceService} from '../projects/project-slice.service';
import {RfvActions} from './rfv.actions';
import {RfvEffects} from './rfv.effects';
import {RfvQueries} from './rfv.queries';

describe('RFV Effects', () => {
    let actions: ReplaySubject<any>;
    let featureToggleHelper: any;
    let rfvEffects: RfvEffects;
    let rfvService: any;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const rfvQueriesMock: RfvQueries = mock(RfvQueries);

    const projectId = 'foo';
    const rfvEntityList: RfvEntity[] = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
    ];

    const errorResponse: Observable<any> = throwError('error');
    const getAllRfvEntitiesResponse: Observable<RfvEntity[]> = of(rfvEntityList);

    const moduleDef: TestModuleMetadata = {
        providers: [
            RfvEffects,
            provideMockActions(() => actions),
            {
                provide: FeatureToggleHelper,
                useValue: jasmine.createSpyObj('FeatureToggleHelper', ['isFeatureActive']),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: RfvQueries,
                useFactory: () => instance(rfvQueriesMock),
            },
            {
                provide: RfvService,
                useValue: jasmine.createSpyObj('RfvService', ['findAll', 'update']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {

        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

        rfvEffects = TestBed.inject(RfvEffects);
        rfvService = TestBed.inject(RfvService);
        featureToggleHelper = TestBed.inject(FeatureToggleHelper);

        actions = new ReplaySubject(1);

        featureToggleHelper.isFeatureActive.calls.reset();
        featureToggleHelper.isFeatureActive.and.returnValue(true);

        rfvService.findAll.calls.reset();
        rfvService.update.calls.reset();
    });

    it('should trigger a RfvActions.Request.AllFulfilled after a successful request', () => {
        const expectedResult = new RfvActions.Request.AllFulfilled(rfvEntityList);

        rfvService.findAll.and.returnValue(getAllRfvEntitiesResponse);
        actions.next(new RfvActions.Request.All());
        rfvEffects.requestAll$.subscribe(result => {
            expect(rfvService.findAll).toHaveBeenCalledTimes(1);
            expect(rfvService.findAll).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RfvActions.Request.AllRejected after a unsuccessful request', () => {
        const expectedResult = new RfvActions.Request.AllRejected();

        rfvService.findAll.and.returnValue(errorResponse);
        actions.next(new RfvActions.Request.All());
        rfvEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RfvActions.Update.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for an RFV update request', () => {
        const results: Action[] = [];
        const rfv = MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: rfv.active, name: 'foo'};
        const firstExpectedResult = new RfvActions.Update.OneFulfilled(rfv);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Rfv_Updated_SuccessMessage')});

        rfvService.update.and.returnValue(of(rfv));
        actions.next(new RfvActions.Update.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as RfvActions.Update.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a RfvActions.Update.OneRejected after a unsuccessful request for a RFV update', () => {
        const rfv = MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: rfv.active, name: 'foo'};
        const expectedResult = new RfvActions.Update.OneRejected(rfv.key);

        rfvService.update.and.returnValue(errorResponse);
        actions.next(new RfvActions.Update.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a RfvActions.ActivateOne.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for a RFV activate request', () => {
        const results: Action[] = [];
        const rfv = MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: !rfv.active, name: rfv.name};
        const firstExpectedResult = new RfvActions.Activate.OneFulfilled(rfv);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Rfv_Activated_SuccessMessage')});

        rfvService.update.and.returnValue(of(rfv));
        actions.next(new RfvActions.Activate.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as RfvActions.Activate.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a RfvActions.Activate.OneRejected after a unsuccessful request for a RFV activate', () => {
        const rfv = MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: !rfv.active, name: rfv.name};
        const expectedResult = new RfvActions.Activate.OneRejected(rfv.key);

        rfvService.update.and.returnValue(errorResponse);
        actions.next(new RfvActions.Activate.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a RfvActions.DeactivateOne.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request for a RFV deactivate request', () => {
        const results: Action[] = [];
        const rfv = MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: !rfv.active, name: rfv.name};
        const firstExpectedResult = new RfvActions.Deactivate.OneFulfilled(rfv);
        const secondExpectedResult =
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Rfv_Deactivated_SuccessMessage')});

        rfvService.update.and.returnValue(of(rfv));
        actions.next(new RfvActions.Deactivate.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => results.push(result));

        const firstResult = results[0] as RfvActions.Deactivate.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a RfvActions.Deactivate.OneRejected after a unsuccessful request for a RFV deactivate', () => {
        const rfv = MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY;
        const rfvPayload: SaveRfvResource = {key: rfv.key, active: !rfv.active, name: rfv.name};
        const expectedResult = new RfvActions.Deactivate.OneRejected(rfv.key);

        rfvService.update.and.returnValue(errorResponse);
        actions.next(new RfvActions.Deactivate.One(projectId, rfvPayload));
        rfvEffects.update$.subscribe(result => expect(result).toEqual(expectedResult));
    });
});
