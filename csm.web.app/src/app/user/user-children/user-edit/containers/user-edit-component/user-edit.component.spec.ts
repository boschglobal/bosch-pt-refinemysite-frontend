/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {CRAFT_RESOURCE_MOCK} from '../../../../../../test/mocks/crafts';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    TEST_USER_RESOURCE_REGISTERED,
    TEST_USER_RESOURCE_UNREGISTERED,
} from '../../../../../../test/mocks/user';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {CraftResource} from '../../../../../craft/api/resources/craft.resource';
import {CraftSliceService} from '../../../../../shared/master-data/store/crafts/craft-slice.service';
import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {SaveUserResource} from '../../../../api/resources/save-user.resource';
import {SaveUserPictureResource} from '../../../../api/resources/save-user-picture.resource';
import {UserResource} from '../../../../api/resources/user.resource';
import {
    UserActions,
    UserPictureActions
} from '../../../../store/user/user.actions';
import {UserQueries} from '../../../../store/user/user.queries';
import {UserCaptureComponentFocus} from '../../../../user-common/presentationals/user-capture-component/user-capture.component';
import {UserCaptureModel} from '../../../../user-common/presentationals/user-capture-component/user-capture.model';
import {UserEditComponent} from './user-edit.component';

describe('User Edit Component', () => {
    let fixture: ComponentFixture<UserEditComponent>;
    let comp: UserEditComponent;
    let de: DebugElement;
    let mockedStore: any;
    let router: Router;

    const userPictureUrl = TEST_USER_RESOURCE_REGISTERED._embedded.profilePicture._links.small.href;

    const blobServiceMock: BlobService = mock(BlobService);
    const userQueriesMock: UserQueries = mock(UserQueries);
    const craftSliceServiceMock: CraftSliceService = mock(CraftSliceService);

    const currentUser: UserResource = TEST_USER_RESOURCE_REGISTERED;
    const mockDefaultValues: UserCaptureModel = {
        picture: null,
        gender: currentUser.gender,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        position: currentUser.position,
        crafts: currentUser.crafts.map((craft: ResourceReference) => craft.id),
        phoneNumbers: currentUser.phoneNumbers.map((phoneNumber: PhoneNumber) => {
            return {
                type: phoneNumber.phoneNumberType,
                countryCode: phoneNumber.countryCode,
                number: phoneNumber.phoneNumber
            };
        }),
        email: currentUser.email,
        locale: currentUser.locale,
        country: currentUser.country,
    };
    const queryParamMap = {
        focus: undefined,
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        queryParamMap: {
                            get: (name: string) => queryParamMap[name],
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useFactory: () => instance(blobServiceMock),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
            {
                provide: CraftSliceService,
                useFactory: () => instance(craftSliceServiceMock),
            },
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate']),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
        declarations: [UserEditComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserEditComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        mockedStore = fixture.debugElement.injector.get(Store) as any;
        router = TestBed.inject(Router);
        when(blobServiceMock.getBlob(userPictureUrl)).thenReturn(of(null));
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(currentUser));
        when(userQueriesMock.observeCurrentUserRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(craftSliceServiceMock.observeCraftList()).thenReturn(of([CRAFT_RESOURCE_MOCK]));

        comp.ngOnInit();
        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should set defaultValues with mocked user capture model from store', () => {
        expect(comp.defaultValues).toEqual(mockDefaultValues);
    });

    it('should set picture value when user has picture', () => {
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));
        when(blobServiceMock.getBlob(userPictureUrl)).thenReturn(of(new Blob()));

        comp.ngOnInit();

        expect(comp.defaultValues.picture).not.toBeNull();
    });

    it('should not set picture value to null when user doesn\'t have picture', () => {
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_UNREGISTERED));

        comp.ngOnInit();

        expect(comp.defaultValues.picture).toBeNull();
    });

    it('should trigger route navigate when user capture is canceled', () => {
        comp.onCancelEdit();
        expect(router.navigate).toHaveBeenCalled();
    });

    it('should trigger onSubmitEdit() when user capture is submitted', () => {
        const mockDefaultValuesWithPicture = mockDefaultValues;
        const saveUserResource: SaveUserResource = {
            gender: currentUser.gender,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            position: currentUser.position,
            craftIds: ['1', '2'],
            phoneNumbers: [new PhoneNumber('+351', '123456789', 'MOBILE')],
            country: currentUser.country,
            locale: currentUser.locale,
        };
        const userUpdateAction = new UserActions.Update.One(saveUserResource);

        spyOn(mockedStore, 'dispatch');

        comp.onSubmitEdit(mockDefaultValuesWithPicture);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(userUpdateAction);
    });

    it('should trigger Delete Picture with userData, defaultValues equal and user picture equal null', () => {
        const mockDefaultValuesWithPicture = mockDefaultValues;
        delete mockDefaultValuesWithPicture.email;
        const userPictureActionDelete = new UserPictureActions.Delete.UserPicture(false);
        const saveUserPictureResource = new SaveUserPictureResource('123', new File([''], 'filename'));
        const userPictureActionCreate = new UserPictureActions.CreateOrUpdate.UserPicture(saveUserPictureResource, true);
        comp.defaultValues.picture = new File([''], 'filename');
        mockDefaultValuesWithPicture.picture = null;

        spyOn(mockedStore, 'dispatch');

        comp.onSubmitEdit(mockDefaultValuesWithPicture);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(userPictureActionDelete);
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(userPictureActionCreate);
    });

    it('should trigger Create/Update Picture with userData, defaultValues equal and new user picture', () => {
        const mockDefaultValuesWithPicture = mockDefaultValues;
        delete mockDefaultValuesWithPicture.email;
        const userPictureActionDelete = new UserPictureActions.Delete.UserPicture(false);
        const saveUserPictureResource = new SaveUserPictureResource(currentUser.id, new File([''], 'filename'));
        const userPictureActionCreate = new UserPictureActions.CreateOrUpdate.UserPicture(saveUserPictureResource, false);
        mockDefaultValuesWithPicture.picture = new File([''], 'filename');

        spyOn(comp, 'onSubmitEdit').and.callThrough();
        spyOn(mockedStore, 'dispatch');

        comp.onSubmitEdit(mockDefaultValuesWithPicture);
        expect(comp.onSubmitEdit).toHaveBeenCalled();
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(userPictureActionDelete);
        expect(mockedStore.dispatch).toHaveBeenCalledWith(userPictureActionCreate);
    });

    it('should set the focus attribute with the value on the url', () => {
        const focusParam: UserCaptureComponentFocus = 'country';

        expect(comp.focus).toBeUndefined();

        queryParamMap.focus = focusParam;
        comp.ngOnInit();

        expect(comp.focus).toBe(focusParam);
    });

    it('should set isLoading to false when observeCurrentUserSubject, observeCraftList and getBlob observables ' +
        'emit and the user has picture', () => {
        comp.isLoading = true;
        const observeCurrentUserSubject = new Subject<UserResource>();
        const getBlobSubject = new Subject<Blob>();
        const observeCraftList = new Subject<CraftResource[]>();

        when(userQueriesMock.observeCurrentUser()).thenReturn(observeCurrentUserSubject);
        when(blobServiceMock.getBlob(userPictureUrl)).thenReturn(getBlobSubject);
        when(craftSliceServiceMock.observeCraftList()).thenReturn(observeCraftList);

        comp.ngOnInit();
        expect(comp.isLoading).toBeTruthy();

        observeCurrentUserSubject.next(currentUser);
        expect(comp.isLoading).toBeTruthy();

        getBlobSubject.next(new Blob());
        expect(comp.isLoading).toBeTruthy();

        observeCraftList.next([CRAFT_RESOURCE_MOCK]);
        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when observeCurrentUserSubject and observeCraftList observables emit ' +
        'and project doesn\'t have picture', () => {
        comp.isLoading = true;
        const observeCurrentUserSubject = new Subject<UserResource>();
        const observeCraftList = new Subject<CraftResource[]>();

        when(userQueriesMock.observeCurrentUser()).thenReturn(observeCurrentUserSubject);
        when(craftSliceServiceMock.observeCraftList()).thenReturn(observeCraftList);

        comp.ngOnInit();
        expect(comp.isLoading).toBeTruthy();

        observeCurrentUserSubject.next(currentUser);
        expect(comp.isLoading).toBeTruthy();

        observeCraftList.next([CRAFT_RESOURCE_MOCK]);
        expect(comp.isLoading).toBeFalsy();
    });
});
