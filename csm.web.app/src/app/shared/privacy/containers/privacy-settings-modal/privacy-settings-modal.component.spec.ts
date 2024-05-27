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
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../../test/mocks/store';
import {State} from '../../../../app.reducers';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ModalIdEnum} from '../../../misc/enums/modal-id.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {ModalInterface} from '../../../ui/modal/containers/modal-component/modal.component';
import {UserPrivacySettings} from '../../api/resources/user-privacy-settings.resource';
import {PrivacySettingsModalComponent} from './privacy-settings-modal.component';

describe('Privacy Settings Modal Component', () => {
    let fixture: ComponentFixture<PrivacySettingsModalComponent>;
    let comp: PrivacySettingsModalComponent;
    let modalService: ModalService;
    let store: Store<State>;

    const userQueriesMock: UserQueries = mock(UserQueries);
    const userPrivacySettings: BehaviorSubject<UserPrivacySettings> = new BehaviorSubject<UserPrivacySettings>(new UserPrivacySettings());

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            PrivacySettingsModalComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PrivacySettingsModalComponent);
        comp = fixture.componentInstance;

        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);

        when(userQueriesMock.observeUserPrivacySettings()).thenReturn(userPrivacySettings);

        fixture.detectChanges();
    });

    it('should open privacy settings modal when privacy settings are not saved', () => {
        spyOn(modalService, 'open');
        const expectedModalConfig: ModalInterface = {
            id: ModalIdEnum.PrivacySettings,
            data: null,
        };

        userPrivacySettings.next(null);

        expect(modalService.open).toHaveBeenCalledWith(expectedModalConfig);
    });

    it('should not open privacy settings modal when privacy settings are already saved', () => {
        spyOn(modalService, 'open');
        const expectedModalConfig: ModalInterface = {
            id: ModalIdEnum.PrivacySettings,
            data: null,
        };

        userPrivacySettings.next(new UserPrivacySettings());

        expect(modalService.open).not.toHaveBeenCalledWith(expectedModalConfig);
    });

    it('should save current selection and close modal when handleSave is called', () => {
        spyOn(store, 'dispatch');
        spyOn(modalService, 'close');
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            comfort: true,
            performance: false,
        };
        const expectedResult = new UserActions.Set.PrivacySettings(privacySettings);

        comp.handleSave(privacySettings);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
        expect(modalService.close).toHaveBeenCalled();
    });
});
