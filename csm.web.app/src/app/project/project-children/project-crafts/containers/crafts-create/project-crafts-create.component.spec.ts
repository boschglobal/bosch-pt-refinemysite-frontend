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
import {UntypedFormBuilder} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    CRAFT_RESOURCE_MOCK,
    MOCK_PROJECT_CRAFTS,
} from '../../../../../../test/mocks/crafts';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {CraftResource} from '../../../../../craft/api/resources/craft.resource';
import {CraftSliceService} from '../../../../../shared/master-data/store/crafts/craft-slice.service';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectCraftResource} from '../../../../project-common/api/crafts/resources/project-craft.resource';
import {ProjectCraftActions} from '../../../../project-common/store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {
    ProjectCraftsCapture,
    ProjectCraftsCaptureComponent
} from '../../presentationals/crafts-capture/project-crafts-capture.component';
import {ProjectCraftsCreateComponent} from './project-crafts-create.component';

describe('Project Crafts Create Component', () => {
    let fixture: ComponentFixture<ProjectCraftsCreateComponent>;
    let comp: ProjectCraftsCreateComponent;
    let store: jasmine.SpyObj<Store>;

    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);
    const craftSliceServiceMock: CraftSliceService = mock(CraftSliceService);

    const currentCraftRequestStatus: BehaviorSubject<RequestStatusEnum> =
        new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);
    const craftsObservable: BehaviorSubject<ProjectCraftResource[]> = new BehaviorSubject<ProjectCraftResource[]>([]);
    const craftListObservable: BehaviorSubject<CraftResource[]> = new BehaviorSubject<CraftResource[]>([]);

    const name = 'foo';
    const color = '#000000';
    const position = 1;
    const formValue: ProjectCraftsCapture = {name, color, position};

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectCraftsCreateComponent,
            ProjectCraftsCaptureComponent,
        ],
        providers: [
            UntypedFormBuilder,
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: ProjectCraftQueries,
                useValue: instance(projectCraftQueriesMock),
            },
            {
                provide: CraftSliceService,
                useValue: instance(craftSliceServiceMock),
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
        fixture = TestBed.createComponent(ProjectCraftsCreateComponent);
        comp = fixture.componentInstance;

        when(projectCraftQueriesMock.observeCrafts()).thenReturn(craftsObservable);
        when(projectCraftQueriesMock.observeCurrentCraftRequestStatus()).thenReturn(currentCraftRequestStatus);
        when(craftSliceServiceMock.observeCraftList()).thenReturn(craftListObservable);

        craftsObservable.next([]);
        currentCraftRequestStatus.next(RequestStatusEnum.empty);
        craftListObservable.next([]);

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        store.dispatch.calls.reset();
        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should set crafts after ngOnInit()', () => {
        comp.crafts = null;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.crafts).toBeDefined();
    });

    it('should set focus after ngOnInit()', () => {
        spyOn(comp.projectCraftsCapture, 'setFocus');

        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.projectCraftsCapture.setFocus).toHaveBeenCalled();
    });

    it('should emit onCancel when handleCancel is triggered', () => {
        comp.projectCraftsCapture.ngOnInit();

        spyOn(comp.onCancel, 'emit');
        spyOn(comp.projectCraftsCapture, 'resetForm');
        comp.handleCancel();

        expect(comp.onCancel.emit).toHaveBeenCalled();
        expect(comp.projectCraftsCapture.resetForm).toHaveBeenCalled();
    });

    it('should set isSubmitting to false and emit onClose when request status has success', waitForAsync(() => {
        const craftReset = new ProjectCraftActions.Update.OneReset();

        currentCraftRequestStatus.next(RequestStatusEnum.success);

        comp.projectCraftsCapture.defaultValues = formValue;
        comp.ngOnInit();

        expect(comp.isSubmitting).toBe(false);
        expect(store.dispatch).toHaveBeenCalledWith(craftReset);
    }));

    it('should trigger ProjectCraftActions.Post.Craft when call handleSubmit()', () => {
        const craftPost = new ProjectCraftActions.Create.One(formValue);

        comp.handleSubmit(formValue);
        expect(store.dispatch).toHaveBeenCalledWith(craftPost);
    });

    it('should set crafts with the correct name', () => {
        craftListObservable.next([CRAFT_RESOURCE_MOCK]);

        expect(comp.crafts[0]).toBe(CRAFT_RESOURCE_MOCK.name);
    });

    it('should set default values position as the length of the crafts + 1', () => {
        const crafts: ProjectCraftResource[] = MOCK_PROJECT_CRAFTS;

        craftsObservable.next(crafts);

        expect(comp.defaultValues.position).toBe(crafts.length + 1);
    });
});
