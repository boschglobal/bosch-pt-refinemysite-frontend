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
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {getExpectedAlertAction} from '../../../../../../test/helpers';
import {MOCK_PAT_RESOURCE} from '../../../../../../test/mocks/pat';
import {SavePATResource} from '../../../../../project/project-common/api/pats/resources/save-pat.resource';
import {AlertMessageResource} from '../../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../../shared/alert/store/alert.actions';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {PATActions} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {PATExpirationEnum} from '../../../../user-common/enums/patExpiration.enum';
import {PATFormData} from '../../presentationals/pat-capture/pat-capture.component';
import {PatCreateComponent} from './pat-create.component';

describe('Pat Create Component', () => {
    let component: PatCreateComponent;
    let de: DebugElement;
    let fixture: ComponentFixture<PatCreateComponent>;
    let store: jasmine.SpyObj<Store>;

    const patFormData: PATFormData = {
        description: 'new',
        expiresAt: PATExpirationEnum.ThirtyDays,
        scope: MOCK_PAT_RESOURCE.scopes,
    };

    const patQueriesMock: PATQueries = mock(PATQueries);
    const patRequestStatusSubject = new Subject<RequestStatusEnum>();

    const tokenSelector = '[data-automation="token"]';
    const getElement = (selector): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [PatCreateComponent],
        providers: [
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: PATQueries,
                useValue: instance(patQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatCreateComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(patQueriesMock.observeCurrentPATRequestStatus()).thenReturn(patRequestStatusSubject);
        when(patQueriesMock.observeCurrentItem()).thenReturn(of(MOCK_PAT_RESOURCE));

        store.dispatch.calls.reset();

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should set isLoading to false when request status in not in progress', () => {
        patRequestStatusSubject.next(RequestStatusEnum.empty);

        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to true when request status is in progress', () => {
        patRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeTruthy();
    });

    it('should call closed when handleClose is triggered', () => {
        spyOn(component.closed, 'emit');

        component.handleClose();

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should dispatch create one action with right payload when handleSubmit is called', () => {
        const savePATResource: SavePATResource = {
            description: patFormData.description,
            scopes: patFormData.scope,
            validForMinutes: Number(patFormData.expiresAt),
        };
        const expectedAction = new PATActions.Create.One(savePATResource);

        component.handleSubmit(patFormData);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not display token when observeCurrentItem return null', () => {
        when(patQueriesMock.observeCurrentItem()).thenReturn(of(null));

        component.ngOnInit();

        expect(getElement(tokenSelector)).toBeUndefined();
    });

    it('should display token when observeCurrentItem return a valid pat resource', () => {
        when(patQueriesMock.observeCurrentItem()).thenReturn(of(MOCK_PAT_RESOURCE));

        expect(getElement(tokenSelector)).toBeDefined();
    });

    it('should dispatch AlertActions.Add.SuccessAlert when handleCopyToken is called', () => {
        const expectedAction = getExpectedAlertAction(new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('PAT_Token_CopyMessage'),
        }));

        component.handleCopyToken();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
