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
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {MockStore} from '../../../../../../test/mocks/store';
import {TEST_USER_SLICE} from '../../../../../../test/mocks/user';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {GenderEnum} from '../../../../../shared/misc/enums/gender.enum';
import {GenericBannerComponent} from '../../../../../shared/misc/presentationals/generic-banner/generic-banner.component';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UserActions} from '../../../../store/user/user.actions';
import {UserProfileComponent} from './user-profile.component';

describe('User Profile Component', () => {
    let fixture: ComponentFixture<UserProfileComponent>;
    let comp: UserProfileComponent;
    let translateService: TranslateServiceStub;
    let mockedStore: any;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule,
        ],
        declarations: [
            GenericBannerComponent,
            UserProfileComponent,
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        userModule: {
                            userSlice: TEST_USER_SLICE,
                        },
                    }
                ),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfileComponent);
        comp = fixture.componentInstance;
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);
        mockedStore = TestBed.inject(Store);

        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should get parsed man gender', () => {
        const expectedResult = 'Mr';
        expect(comp.profile.gender).toBe(expectedResult);
    });

    it('should get parsed woman gender', () => {
        const expectedResult = 'Ms';
        mockedStore._value.userModule.userSlice.items[0].gender = GenderEnum.female;
        comp.ngOnInit();

        expect(comp.profile.gender).toBe(expectedResult);
    });

    it('should get parsed crafts', () => {
        const expectedResult = 'a, z';
        expect(comp.profile.crafts).toBe(expectedResult);
    });

    it('should ensure that a request of user is made after language change', () => {
        const requestUserAction = new UserActions.Request.Current();

        spyOn(mockedStore, 'dispatch');
        comp.ngOnInit();

        translateService.setDefaultLang('de');
        fixture.detectChanges();

        expect(mockedStore.dispatch).toHaveBeenCalledWith(requestUserAction);
    });
});
