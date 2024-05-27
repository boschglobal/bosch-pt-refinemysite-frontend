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
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment/moment';

import {updateWindowInnerWidth} from '../../../../../../test/helpers';
import {
    MOCK_PAT_LIST_RESOURCE,
    MOCK_PAT_RESOURCE
} from '../../../../../../test/mocks/pat';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {DayMonthFullYearDateTimeFormatEnum} from '../../../../../project/project-common/enums/date-format.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {BreakpointsEnum} from '../../../../../shared/ui/constants/breakpoints.constant';
import {IfMediaQueryDirective} from '../../../../../shared/ui/directives/if-media-query.directive';
import {PatContentModel} from '../../containers/pat-content-model/pat-content.model';
import {PatListComponent} from './pat-list.component';

describe('Pat List Component', () => {
    let comp: PatListComponent;
    let fixture: ComponentFixture<PatListComponent>;
    let de: DebugElement;

    const patListTableLarge = '[data-automation="pat-list-table-large"]';
    const patListTableSmall = '[data-automation="pat-list-table-small"]';

    const getElement = (selector: string): DebugElement => de.query(By.css(selector))?.nativeElement;

    const PAT_CONTENTS_MODEL_LIST: PatContentModel[] = MOCK_PAT_LIST_RESOURCE.items.map(i => PatContentModel.fromPATResource(i));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            PatListComponent,
            IfMediaQueryDirective,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    const getFormattedDate = (date: string): string => {
        const currentLang: string = new TranslateServiceStub().defaultLang;
        const dateFormat: string = DayMonthFullYearDateTimeFormatEnum[currentLang];

        return moment(date).locale(currentLang).format(dateFormat);
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.pats = PAT_CONTENTS_MODEL_LIST;
        comp.ngOnInit();

        fixture.detectChanges();
    });

    it('should set settings after ngOnInit()', () => {
        expect(comp.settings).toBeTruthy();
    });

    it('should emit patDeleteClicked with the right data when delete button is clicked', () => {
        spyOn(comp.patDeleteClicked, 'emit').and.callThrough();

        comp.onClickDelete(PAT_CONTENTS_MODEL_LIST[0].id);

        expect(comp.patDeleteClicked.emit).toHaveBeenCalledWith(PAT_CONTENTS_MODEL_LIST[0].id);
    });

    it('should emit patEditClicked with the right data when edit button is clicked', () => {
        spyOn(comp.patEditClicked, 'emit').and.callThrough();

        comp.onClickEdit(MOCK_PAT_LIST_RESOURCE[0]);

        expect(comp.patEditClicked.emit).toHaveBeenCalledWith(MOCK_PAT_LIST_RESOURCE[0]);
    });

    it('it should set patsList with the correct default values', () => {
        const newList: PatContentModel[] = [
            PatContentModel.fromPATResource({...MOCK_PAT_RESOURCE, expiresAt: '2023-10-19T14:34:08.763Z'}),
            PatContentModel.fromPATResource({...MOCK_PAT_RESOURCE, expiresAt: '2025-05-02T05:12:08.763Z'}),
        ];
        const expectedValue: PatContentModel[] = [
            {
                ...newList[0],
                expiresAt: getFormattedDate(newList[0].expiresAt),
            },
            {
                ...newList[1],
                expiresAt: getFormattedDate(newList[1].expiresAt),
            },
        ];

        comp.pats = newList;
        fixture.detectChanges();

        expect(comp.patsList).toEqual(expectedValue);
    });

    it('it should show the small table when the window inner width is sm', () => {
        updateWindowInnerWidth(BreakpointsEnum.sm);

        fixture.detectChanges();

        expect(getElement(patListTableLarge)).toBeFalsy();
        expect(getElement(patListTableSmall)).toBeTruthy();
    });

    it('it should show the large table when the window inner width is xl', () => {
        updateWindowInnerWidth(BreakpointsEnum.xl);

        fixture.detectChanges();

        expect(getElement(patListTableLarge)).toBeTruthy();
        expect(getElement(patListTableSmall)).toBeFalsy();
    });
});
