/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    throwError,
} from 'rxjs';

import {MockStore} from '../../../../test/mocks/store';
import {
    TEST_USER_RESOURCE_REGISTERED,
    TEST_USER_SLICE
} from '../../../../test/mocks/user';
import {USER_PICTURE_1} from '../../../../test/mocks/user-picture';
import {AlertActions} from '../../../shared/alert/store/alert.actions';
import {PrivacyService} from '../../../shared/privacy/api/privacy.service';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {SaveUserResource} from '../../api/resources/save-user.resource';
import {SaveUserPictureResource} from '../../api/resources/save-user-picture.resource';
import {UserResource} from '../../api/resources/user.resource';
import {UserPictureResource} from '../../api/resources/user-picture.resource';
import {UserService} from '../../api/user.service';
import {UserLegalDocumentsService} from '../../api/user-legal-documents.service';
import {UserPictureService} from '../../api/user-picture.service';
import {
    UserActions,
    UserPictureActions
} from './user.actions';
import {UserEffects} from './user.effects';

describe('User Effects', () => {
    let userEffects: UserEffects;
    let userLegalDocumentsService: jasmine.SpyObj<UserLegalDocumentsService>;
    let userService: any;
    let userPictureService: any;
    let privacyService: any;
    let actions: ReplaySubject<any>;

    const emptyResponse: Observable<{}> = of({});
    const errorResponse: Observable<any> = throwError('error');
    const requestUserResponse: Observable<UserResource> = of(TEST_USER_RESOURCE_REGISTERED);
    const createUserResponse: Observable<UserResource> = of(TEST_USER_RESOURCE_REGISTERED);
    const updateUserResponse: Observable<UserResource> = of(TEST_USER_RESOURCE_REGISTERED);
    const uploadUserPictureResponse: Observable<UserPictureResource> = of(USER_PICTURE_1);

    const SAVE_USER_RESOURCE: SaveUserResource = {
        gender: '',
        firstName: '',
        lastName: '',
        position: '',
        craftIds: [],
        phoneNumbers: [],
    };

    const SAVE_USER_RESOURCE_EULA_ACCEPTED: SaveUserResource = Object.assign({}, SAVE_USER_RESOURCE, {
        eulaAccepted: true,
    });

    const UPLOAD_USER_PICTURE: SaveUserPictureResource = {
        id: TEST_USER_RESOURCE_REGISTERED.id,
        picture: new File([''], 'filename'),
    };

    const PUT_USER_SUCCESS_ALERT_PAYLOAD: any = {
        message: {
            key: 'User_Edit_SuccessMessage',
        },
    };

    const storeInitialState = {
        userModule: {
            userSlice: TEST_USER_SLICE,
        },
    };

    const mockStore = new MockStore(storeInitialState);

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            {
                provide: PrivacyService,
                useValue: jasmine.createSpyObj('PrivacyService', ['findPrivacySettings', 'updatePrivacySettings']),
            },
            UserEffects,
            {
                provide: UserLegalDocumentsService,
                useValue: jasmine.createSpyObj('UserLegalDocumentsService', ['consents']),
            },
            {
                provide: UserService,
                useValue: jasmine.createSpyObj('UserService', ['findCurrent', 'update', 'create']),
            },
            {
                provide: UserPictureService,
                useValue: jasmine.createSpyObj('UserPictureService', ['upload', 'remove']),
            },
            {
                provide: Store,
                useValue: mockStore,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        userEffects = TestBed.inject(UserEffects);
        userLegalDocumentsService = TestBed.inject(UserLegalDocumentsService) as jasmine.SpyObj<UserLegalDocumentsService>;
        userService = TestBed.inject(UserService);
        userPictureService = TestBed.inject(UserPictureService);
        privacyService = TestBed.inject(PrivacyService);
        actions = new ReplaySubject(1);

        mockStore.nextMock(storeInitialState);
    });

    it('should trigger a UserActions.Request.CurrentFulfilled action after find the user successfully', () => {
        const expectedResult = new UserActions.Request.CurrentFulfilled(TEST_USER_RESOURCE_REGISTERED);

        userService
            .findCurrent
            .and
            .returnValue(requestUserResponse);

        actions.next(new UserActions.Request.Current());

        userEffects
            .requestCurrent$
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should trigger a UserActions.Request.CurrentRejected action after the find of the user has failed', () => {
        const expectedResult = new UserActions.Request.CurrentRejected();

        userService
            .findCurrent
            .and
            .returnValue(errorResponse);

        actions.next(new UserActions.Request.Current());

        userEffects
            .requestCurrent$
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should trigger a UserActions.Request.Current action after UserPictureActions.CreateOrUpdate.UserPictureFulfilled', () => {
        const expectedResult = new UserActions.Request.Current();

        actions.next(new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(USER_PICTURE_1));

        userEffects
            .triggerRequestActions$
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should trigger a UserActions.Request.Current action after UserPictureActions.Delete.UserPictureFulfilled', () => {
        const expectedResult = new UserActions.Request.Current();

        actions.next(new UserPictureActions.Delete.UserPictureFulfilled(TEST_USER_RESOURCE_REGISTERED.id));

        userEffects
            .triggerRequestActions$
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should trigger a UserActions.Create.OneFulfilled action after creating user' +
        ' and consenting to the legal documents successfully', () => {
        const expectedResult = new UserActions.Create.OneFulfilled(TEST_USER_RESOURCE_REGISTERED);

        userService.create.and.returnValue(createUserResponse);
        userLegalDocumentsService.consents.and.returnValue(emptyResponse);
        actions.next(new UserActions.Create.One(SAVE_USER_RESOURCE_EULA_ACCEPTED, []));
        userEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Create.OneFulfilled action after uploading user profile picture successfully', () => {
        const expectedResult = new UserActions.Create.OneFulfilled(TEST_USER_RESOURCE_REGISTERED);
        const file = new File([], 'profilePicture');

        userService.create.and.returnValue(createUserResponse);
        userLegalDocumentsService.consents.and.returnValue(emptyResponse);
        userPictureService.upload.and.returnValue(of({}));
        actions.next(new UserActions.Create.One(SAVE_USER_RESOURCE_EULA_ACCEPTED, [], file));
        userEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Create.OneFulfilled action after uploading user profile picture has failed', () => {
        const expectedResult = new UserActions.Create.OneFulfilled(TEST_USER_RESOURCE_REGISTERED);
        const file = new File([], 'profilePicture');

        userService.create.and.returnValue(createUserResponse);
        userLegalDocumentsService.consents.and.returnValue(emptyResponse);
        userPictureService.upload.and.returnValue(errorResponse);
        actions.next(new UserActions.Create.One(SAVE_USER_RESOURCE_EULA_ACCEPTED, [], file));
        userEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Create.OneFulfilled action after consenting to the legal documents has failed', () => {
        const expectedResult = new UserActions.Create.OneFulfilled(TEST_USER_RESOURCE_REGISTERED);

        userService.create.and.returnValue(createUserResponse);
        userLegalDocumentsService.consents.and.returnValue(errorResponse);
        actions.next(new UserActions.Create.One(SAVE_USER_RESOURCE_EULA_ACCEPTED, []));
        userEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Create.OneRejected action after creating user has failed', () => {
        const expectedResult = new UserActions.Create.OneRejected();

        userService.create.and.returnValue(errorResponse);
        actions.next(new UserActions.Create.One(SAVE_USER_RESOURCE, []));
        userEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Update.OneFulfilled action after put user successfully', () => {
        const expectedResult = new UserActions.Update.OneFulfilled(TEST_USER_RESOURCE_REGISTERED);

        userService.update.and.returnValue(updateUserResponse);
        actions.next(new UserActions.Update.One(SAVE_USER_RESOURCE));
        userEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Update.OneRejected action after put user has failed', () => {
        const expectedResult = new UserActions.Update.OneRejected();

        userService.update.and.returnValue(errorResponse);
        actions.next(new UserActions.Update.One(SAVE_USER_RESOURCE));
        userEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserPictureActions.CreateOrUpdate.UserPictureFulfilled action after uploading a user picture successfully', () => {
        const expectedResult = new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(USER_PICTURE_1);

        userPictureService.upload.and.returnValue(uploadUserPictureResponse);
        actions.next(new UserPictureActions.CreateOrUpdate.UserPicture(UPLOAD_USER_PICTURE));
        userEffects.uploadPicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserPictureActions.CreateOrUpdate.UserPictureRejected action after uploading a user picture has failed', () => {
        const expectedResult = new UserPictureActions.CreateOrUpdate.UserPictureRejected();

        userPictureService.upload.and.returnValue(errorResponse);
        actions.next(new UserPictureActions.CreateOrUpdate.UserPicture(UPLOAD_USER_PICTURE));
        userEffects.uploadPicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserPictureActions.Delete.UserPictureFulfilled action after deleting a user picture successfully', () => {
        const expectedResult = new UserPictureActions.Delete.UserPictureFulfilled(TEST_USER_RESOURCE_REGISTERED.id);

        userPictureService.remove.and.returnValue(uploadUserPictureResponse);
        actions.next(new UserPictureActions.Delete.UserPicture());
        userEffects.deletePicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserPictureActions.Delete.UserPictureRejected action after deleting a user picture has failed', () => {
        const expectedResult = new UserPictureActions.Delete.UserPictureRejected();

        userPictureService.remove.and.returnValue(errorResponse);
        actions.next(new UserPictureActions.Delete.UserPicture());
        userEffects.deletePicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after ' +
        'a UserActions.Update.OneFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(PUT_USER_SUCCESS_ALERT_PAYLOAD);

        actions.next(new UserActions.Update.OneFulfilled(TEST_USER_RESOURCE_REGISTERED));
        userEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after ' +
        'a UserPictureActions.Delete.UserPictureFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(PUT_USER_SUCCESS_ALERT_PAYLOAD);

        actions.next(new UserPictureActions.Delete.UserPictureFulfilled(TEST_USER_RESOURCE_REGISTERED.id));
        userEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after ' +
        'a UserPictureActions.CreateOrUpdate.UserPictureFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(PUT_USER_SUCCESS_ALERT_PAYLOAD);

        actions.next(new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(USER_PICTURE_1));
        userEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should not trigger a AlertActions.Add.SuccessAlert action with success payload after ' +
        'a UserPictureActions.CreateOrUpdate.UserPictureFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(PUT_USER_SUCCESS_ALERT_PAYLOAD);

        actions.next(new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(USER_PICTURE_1, true));
        userEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a UserActions.Set.PrivacySettingsFulfilled action after setting current userSettings successfully', () => {
        const privacySettings = new UserPrivacySettings();
        const expectedResult = new UserActions.Set.PrivacySettingsFulfilled(privacySettings);

        privacyService.updatePrivacySettings.and.returnValue(of(privacySettings));

        actions.next(new UserActions.Set.PrivacySettings(privacySettings));
        userEffects.setPrivacySettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Set.PrivacySettingsRejected action after setting current userSettings has failed', () => {
        const privacySettings = new UserPrivacySettings();
        const expectedResult = new UserActions.Set.PrivacySettingsRejected();

        privacyService.updatePrivacySettings.and.returnValue(errorResponse);

        actions.next(new UserActions.Set.PrivacySettings(privacySettings));
        userEffects.setPrivacySettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Set.PrivacySettingsFulfilled action after requesting privacySettings successfully', () => {
        const privacySettings = new UserPrivacySettings();
        const expectedResult = new UserActions.Set.PrivacySettingsFulfilled(privacySettings);

        privacyService.findPrivacySettings.and.returnValue(of(privacySettings));

        actions.next(new UserActions.Request.PrivacySettings());
        userEffects.requestPrivacySettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UserActions.Set.PrivacySettingsRejected action after requesting current privacySettings has failed', () => {
        const expectedResult = new UserActions.Set.PrivacySettingsRejected();

        privacyService.findPrivacySettings.and.returnValue(errorResponse);

        actions.next(new UserActions.Request.PrivacySettings());
        userEffects.requestPrivacySettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
