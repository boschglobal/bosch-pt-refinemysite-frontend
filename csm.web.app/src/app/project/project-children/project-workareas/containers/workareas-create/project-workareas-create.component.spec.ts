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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_WORKAREAS} from '../../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectWorkareasCaptureComponent} from '../../presentationals/workareas-capture/project-workareas-capture.component';
import {ProjectWorkareasCreateComponent} from './project-workareas-create.component';

describe('Project Workareas Create Component', () => {
    let fixture: ComponentFixture<ProjectWorkareasCreateComponent>;
    let comp: ProjectWorkareasCreateComponent;

    const mockProjectWorkareaQueries: WorkareaQueries = mock(WorkareaQueries);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectWorkareasCreateComponent,
            ProjectWorkareasCaptureComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(mockProjectWorkareaQueries),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectWorkareasCreateComponent);
        comp = fixture.componentInstance;

        when(mockProjectWorkareaQueries.observeCurrentWorkareaRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(mockProjectWorkareaQueries.observeWorkareas()).thenReturn(of(MOCK_WORKAREAS));
    });

    afterAll(() => comp.ngOnDestroy());

    it('should set defaultValues after ngOnInit()', () => {
        comp.defaultValues = null;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.defaultValues).toBeDefined();
    });

    it('should set focus after ngOnInit()', () => {
        spyOn(comp.projectWorkareasCapture, 'setFocus');

        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.projectWorkareasCapture.setFocus).toHaveBeenCalled();
    });

    it('should emit onCancel when handleCancel is triggered', () => {
        comp.projectWorkareasCapture.ngOnInit();

        spyOn(comp.onCancel, 'emit');
        comp.handleCancel();

        expect(comp.onCancel.emit).toHaveBeenCalled();
    });
});
