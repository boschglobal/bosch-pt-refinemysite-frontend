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
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {
    CRAFT_LIST_RESOURCE_MOCK,
    CRAFT_RESOURCE_MOCK
} from '../../../../../test/mocks/crafts';
import {MockStore} from '../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {CraftService} from '../../../../craft/api/craft.service';
import {CraftListResource} from '../../../../craft/api/resources/craft-list.resource';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {CraftActions} from './craft.actions';
import {CraftEffects} from './craft.effects';

describe('Craft Effects', () => {
    let craftEffects: CraftEffects;
    let craftService: any;
    let translateService: TranslateServiceStub;
    let store: Store<State>;
    let actions: ReplaySubject<any>;

    const languageDEIdentifier = 'de';
    const languageENIdentifier = 'en';
    const errorResponse: Observable<any> = throwError('error');
    const findAllCraftsResponse: Observable<CraftListResource> = of(CRAFT_LIST_RESOURCE_MOCK);
    const fulfilledPayload: any = {
        currentLang: languageENIdentifier,
        ...CRAFT_LIST_RESOURCE_MOCK
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            CraftEffects,
            provideMockActions(() => actions),
            {
                provide: CraftService,
                useValue: jasmine.createSpyObj('CraftService', ['findAll'])
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        masterDataModule: {
                            craftSlice: {
                                used: true,
                                list: {
                                    en: [],
                                    de: [CRAFT_RESOURCE_MOCK]
                                },
                                requestStatus: RequestStatusEnum.empty
                            }
                        }
                    }
                )
            },
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
        craftEffects = TestBed.inject(CraftEffects);
        craftService = TestBed.inject(CraftService);
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);
        store = TestBed.inject(Store);
        actions = new ReplaySubject(1);
    });

    afterEach(() => {
        translateService.setDefaultLang(languageENIdentifier);
    });

    it('should trigger a REQUEST_CRAFTS_FULFILLED action after requesting crafts successfully', () => {
        const expectedResult = new CraftActions.Request.CraftsFulfilled(fulfilledPayload);

        craftService.findAll.and.returnValue(findAllCraftsResponse);
        actions.next(new CraftActions.Request.Crafts());
        craftEffects.requestCrafts$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_CRAFTS_REJECTED action after requesting crafts has failed', () => {
        const expectedResult = new CraftActions.Request.CraftsRejected();

        craftService.findAll.and.returnValue(errorResponse);
        actions.next(new CraftActions.Request.Crafts());
        craftEffects.requestCrafts$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_CRAFTS_REJECTED action after language change and crafts have already been requested', () => {
        const expectedResult = new CraftActions.Request.CraftsRejected();

        translateService.setDefaultLang(languageDEIdentifier);
        actions.next(new CraftActions.Request.Crafts());
        craftEffects.requestCrafts$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
