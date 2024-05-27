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
import {Action} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {MOCK_PROJECT_COPY_RESOURCE_1} from '../../../../../test/mocks/project-copy';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectCopyService} from '../../api/project-copy/project-copy.service';
import {ProjectCopyAction} from './project-copy.actions';
import {ProjectCopyEffects} from './project-copy.effects';

describe('Project Copy Effects', () => {
    let projectCopyEffects: ProjectCopyEffects;
    let projectCopyService: any;
    let actions: ReplaySubject<any>;

    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            {
                provide: ProjectCopyService,
                useValue: jasmine.createSpyObj('ProjectCopyService', [
                    'copyOne',
                ]),
            },
            ProjectCopyEffects,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCopyEffects = TestBed.inject(ProjectCopyEffects);
        projectCopyService = TestBed.inject(ProjectCopyService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a ProjectCopyAction.Copy.OneFulfilled and a AlertActions.Add.NeutralAlert action after requesting a copy' +
        ' of the project successfully', () => {
        const results: Action[] = [];
        const expectedFirstAction = new ProjectCopyAction.Copy.OneFulfilled('foo');
        const expectedSecondAction = new AlertActions.Add.NeutralAlert(
            {message: new AlertMessageResource('Job_ProjectCopyCard_RunningStatusTitle')});

        projectCopyService.copyOne.and.returnValue(of({id: 'foo'}));

        actions.next(new ProjectCopyAction.Copy.One(MOCK_PROJECT_1.id, MOCK_PROJECT_COPY_RESOURCE_1));
        projectCopyEffects.copyProject$.subscribe(result => results.push(result));

        const firstAction = results[0] as ProjectCopyAction.Copy.OneFulfilled;
        const secondAction = results[1] as AlertActions.Add.NeutralAlert;

        expect(firstAction).toEqual(expectedFirstAction);
        expect(secondAction.type).toBe(expectedSecondAction.type);
        expect(secondAction.payload.type).toBe(expectedSecondAction.payload.type);
        expect(secondAction.payload.message).toEqual(expectedSecondAction.payload.message);
    });

    it('should trigger a ProjectCopyAction.Copy.OneRejected action after requesting a copy of the project without success', () => {
        const expectedResult = new ProjectCopyAction.Copy.OneRejected();

        projectCopyService.copyOne.and.returnValue(errorResponse);
        actions.next(new ProjectCopyAction.Copy.One(MOCK_PROJECT_1.id, MOCK_PROJECT_COPY_RESOURCE_1));
        projectCopyEffects.copyProject$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
