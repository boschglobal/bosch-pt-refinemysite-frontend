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
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {CRAFT_RESOURCE_MOCK} from '../../../../../test/mocks/crafts';
import {MockStore} from '../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {CraftSliceService} from './craft-slice.service';

describe('Craft Slice Service', () => {
    let craftSliceService: CraftSliceService;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        masterDataModule: {
                            craftSlice: {
                                used: true,
                                list: {
                                    en: [CRAFT_RESOURCE_MOCK],
                                    de: [],
                                    es: [],
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
        craftSliceService = TestBed.inject(CraftSliceService);
    });

    it('should retrieve observable of craft list', () => {
        craftSliceService.observeCraftList().subscribe((list) => {
            expect(list).toEqual([CRAFT_RESOURCE_MOCK]);
        });
    });

    it('should retrieve observable of a craft by id', () => {
        const craftId = '123';

        craftSliceService.observeCraftById(craftId).subscribe((craft) => {
            expect(craft).toEqual(CRAFT_RESOURCE_MOCK);
        });
    });
});
