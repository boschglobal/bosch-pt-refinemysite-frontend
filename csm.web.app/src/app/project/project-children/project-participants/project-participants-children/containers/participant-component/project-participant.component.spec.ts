/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {provideMockStore} from '@ngrx/store/testing';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2
} from '../../../../../../../test/mocks/participants';
import {ActivatedRouteStub} from '../../../../../../../test/stubs/activated-route.stub';
import {RouterStub} from '../../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {ResourceReference} from '../../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ProjectParticipantResource} from '../../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectParticipantActions} from '../../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantComponent} from './project-participant.component';

describe('Project Participant Component', () => {
    let fixture: ComponentFixture<ProjectParticipantComponent>;
    let comp: ProjectParticipantComponent;
    let translateService: TranslateService;
    let store: any;

    const participant: ProjectParticipantResource = MOCK_PARTICIPANT;
    const initialState = {
        projectModule: {
            projectParticipantSlice: {
                currentItem: {
                    id: participant.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: [participant],
            },
        },
    };
    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        imports: [TranslateModule.forRoot()],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: ActivatedRoute,
                useClass: ActivatedRouteStub,
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            provideMockStore({initialState}),
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            ProjectParticipantComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantComponent);
        comp = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);
        store = TestBed.inject(Store);

        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should get parsed gender', waitForAsync(() => {
        const expectedResult = 'Mr';
        expect(comp.profile.gender).toBe(expectedResult);
    }));

    it('should get parsed crafts', waitForAsync(() => {
        const expectedResult = 'craft-1, craft-2';
        expect(comp.profile.crafts).toBe(expectedResult);
    }));

    it('should handle language change and request participant again', waitForAsync(() => {
        const language = 'de';
        const action = new ProjectParticipantActions.Request.One(participant.id);

        spyOn(store, 'dispatch').and.callThrough();

        comp.ngOnInit();
        translateService.setDefaultLang(language);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    }));

    it('should return female gender', waitForAsync(() => {
        const newState = cloneDeep(initialState);
        const expectedResult = 'Ms';

        newState.projectModule.projectParticipantSlice.items = [MOCK_PARTICIPANT_2];
        newState.projectModule.projectParticipantSlice.currentItem.id = MOCK_PARTICIPANT_2.id;

        setStoreState(newState);

        comp.ngOnInit();
        expect(comp.profile.gender).toBe(expectedResult);
    }));

    it('should not set profile if no participant exists', waitForAsync(() => {
        const newState = cloneDeep(initialState);

        comp.profile = null;

        newState.projectModule.projectParticipantSlice.items = [];
        newState.projectModule.projectParticipantSlice.currentItem.id = null;

        setStoreState(newState);

        comp.ngOnInit();
        expect(comp.profile).toBe(null);
    }));

    it('should set profile crafts correctly when participant has crafts', () => {
        const newCrafts = [new ResourceReference('111', 'foo'), new ResourceReference('222', 'bar')];
        const expectedResult = newCrafts.map(craft => craft.displayName).join(', ');
        const newState = cloneDeep(initialState);
        const participantCopy = Object.assign({}, participant, {crafts: newCrafts});

        newState.projectModule.projectParticipantSlice.items = [participantCopy];

        setStoreState(newState);

        comp.ngOnInit();
        expect(comp.profile.crafts).toEqual(expectedResult);
    });

    it('should set profile crafts correctly when participant has no crafts', () => {
        const expectedResult = '';
        const newState = cloneDeep(initialState);
        const participantCopy = Object.assign({}, {...participant});
        delete participantCopy.crafts;

        newState.projectModule.projectParticipantSlice.items = [participantCopy];

        setStoreState(newState);

        comp.ngOnInit();
        expect(comp.profile.crafts).toEqual(expectedResult);
    });
});
