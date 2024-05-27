/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {StoreModule} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {
    INITIAL_STATE,
    REDUCER
} from '../../../../../app.reducers';
import {MiscModule} from '../../../../../shared/misc/misc.module';
import {ProjectParticipantsSortingComponent} from './project-participants-sorting.component';

describe('Project Participants Sorting Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsSortingComponent>;
    let comp: ProjectParticipantsSortingComponent;

    const moduleDef: TestModuleMetadata = {
        imports: [
            MiscModule,
            StoreModule.forRoot(REDUCER, {initialState: INITIAL_STATE})
        ],
        declarations: [
            ProjectParticipantsSortingComponent
        ],
        providers: [
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
        fixture = TestBed.createComponent(ProjectParticipantsSortingComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should emit event onClose when sort is cancelled', () => {
        spyOn(comp.close, 'emit');
        comp.handleCancel();
        expect(comp.close.emit).toHaveBeenCalled();
    });
});
