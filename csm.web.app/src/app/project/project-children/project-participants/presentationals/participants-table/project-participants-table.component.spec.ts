/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router,
    RouterModule
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {of} from 'rxjs';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_4,
    MOCK_PARTICIPANTS
} from '../../../../../../test/mocks/participants';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {REDUCER} from '../../../../../app.reducers';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectParticipantsListRowModel} from '../../containers/participants-content/project-participants-content.model';
import {ProjectParticipantsTableComponent} from './project-participants-table.component';

describe('Project Participants Table Component', () => {
    let fixture: ComponentFixture<ProjectParticipantsTableComponent>;
    let comp: ProjectParticipantsTableComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationTableHeaderRole = '[data-automation="table-header-role"]';
    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="table-${area}-${field}"]`;

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
            StoreModule.forRoot(REDUCER),
            EffectsModule.forRoot([]),
        ],
        declarations: [
            ProjectParticipantsTableComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: ROUTE_PARAM_PROJECT_ID,
                                }],
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Router,
                useValue: RouterModule,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectParticipantsTableComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        comp.participants = MOCK_PARTICIPANTS.map(participant => ProjectParticipantsListRowModel.fromResource(participant));
    });

    it('should set settings after ngOnInit()', waitForAsync(() => {
        comp.ngOnInit();
        fixture.detectChanges();
        expect(comp.settings).toBeTruthy();
    }));

    it('should set sortable direction when user sort changes', waitForAsync(() => {
        comp.sort = new SorterData('user', SortDirectionEnum.desc);
        expect(comp.settings.headers[0].sortable.direction).toBe(SortDirectionEnum.desc);
    }));

    it('should trigger onSortTable with the right params when role is clicked', () => {
        comp.sort = new SorterData('role', SortDirectionEnum.desc);
        spyOn(comp, 'onSortTable').and.callThrough();
        fixture.detectChanges();
        el.querySelector(dataAutomationTableHeaderRole).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalled();
        expect(comp.onSortTable).toHaveBeenCalledWith(new SorterData('role', SortDirectionEnum.asc));
    });

    it('should emit onClickRowTable when clicking row', () => {
        const field = '0';

        spyOn(comp, 'onClickRowTable').and.callThrough();

        fixture.detectChanges();
        el.querySelector(getTableAreaFieldSelector('row', field)).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onClickRowTable).toHaveBeenCalled();
    });

    it('should emit onClickRowTable only when participant is active', () => {
        const spy = spyOn(comp.onClickRow, 'emit');
        const mockActiveParticipantRowModel = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT);
        const mockInvitedParticipantRowModel = ProjectParticipantsListRowModel.fromResource(MOCK_PARTICIPANT_4);

        comp.onClickRowTable(mockActiveParticipantRowModel);
        expect(comp.onClickRow.emit).toHaveBeenCalledTimes(1);

        spy.calls.reset();

        comp.onClickRowTable(mockInvitedParticipantRowModel);
        expect(comp.onClickRow.emit).not.toHaveBeenCalled();
    });

    it('should emit actionClicked when handleDropdownItemClicked is called', () => {
        const item: MenuItem = {
            id: 'foo',
            label: 'foo',
            type: 'button',
        };

        spyOn(comp.actionClicked, 'emit');

        comp.handleDropdownItemClicked(item);

        expect(comp.actionClicked.emit).toHaveBeenCalledWith(item);
    });
});
