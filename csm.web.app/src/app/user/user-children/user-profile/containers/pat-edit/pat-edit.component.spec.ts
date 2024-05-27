/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_PAT_RESOURCE} from '../../../../../../test/mocks/pat';
import {SavePATResource} from '../../../../../project/project-common/api/pats/resources/save-pat.resource';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {
    PATActions,
    UpdatePATPayload
} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {PATExpirationEnum} from '../../../../user-common/enums/patExpiration.enum';
import {PATFormData} from '../../presentationals/pat-capture/pat-capture.component';
import {PatEditComponent} from './pat-edit.component';

describe('Pat Edit Component', () => {
    let component: PatEditComponent;
    let fixture: ComponentFixture<PatEditComponent>;
    let store: jasmine.SpyObj<Store>;

    const patFormData: PATFormData = {
        description: 'new',
        expiresAt: PATExpirationEnum.ThirtyDays,
        scope: MOCK_PAT_RESOURCE.scopes,
    };

    const patQueriesMock: PATQueries = mock(PATQueries);
    const patRequestStatusSubject = new Subject<RequestStatusEnum>();

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [PatEditComponent],
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
        fixture = TestBed.createComponent(PatEditComponent);
        component = fixture.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(patQueriesMock.observeCurrentPATRequestStatus()).thenReturn(patRequestStatusSubject);

        store.dispatch.calls.reset();

        component.defaultValue = MOCK_PAT_RESOURCE;

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should set isLoading to false when request status in not in progress and the component is not submitting', () => {
        patRequestStatusSubject.next(RequestStatusEnum.empty);

        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when request status is in progress and the component is not submitting', () => {
        patRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to true and call closed when request status is in progress and the component is submitting', () => {
        spyOn(component.closed, 'emit');

        component.handleSubmit(patFormData);
        patRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeTruthy();

        patRequestStatusSubject.next(RequestStatusEnum.success);

        expect(component.isLoading).toBeFalsy();
        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should call closed when handleClose is triggered', () => {
        spyOn(component.closed, 'emit');

        component.handleClose();

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should dispatch update one action with right payload when handleSubmit is called', () => {
        const savePATResource: SavePATResource = {
            description: patFormData.description,
            scopes: patFormData.scope,
            validForMinutes: Number(patFormData.expiresAt),
        };
        const updatePATPayload: UpdatePATPayload = {
            savePATResource,
            version: MOCK_PAT_RESOURCE.version,
            patId: MOCK_PAT_RESOURCE.id,
        };
        const expectedAction = new PATActions.Update.One(updatePATPayload);

        component.handleSubmit(patFormData);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
