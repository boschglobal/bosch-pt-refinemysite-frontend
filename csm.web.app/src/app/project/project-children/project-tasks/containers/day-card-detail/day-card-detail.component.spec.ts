/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {TranslateService} from '@ngx-translate/core';
import {flatten} from 'lodash';
import * as moment from 'moment';

import {MOCK_DAY_CARD_A} from '../../../../../../test/mocks/day-cards';
import {MockStore} from '../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {TextLinkComponent} from '../../../../../shared/ui/text-link/text-link.component';
import {DayCardDateFormatEnum} from '../../../../project-common/enums/date-format.enum';
import {DayCard} from '../../../../project-common/models/day-cards/day-card';
import {
    DayCardActions,
    DeleteDayCardPayload
} from '../../../../project-common/store/day-cards/day-card.actions';
import {
    DayCardDetailComponent,
    DELETE_DAYCARD_ITEM_ID,
} from './day-card-detail.component';

describe('Day Card Detail Component', () => {
    let comp: DayCardDetailComponent;
    let fixture: ComponentFixture<DayCardDetailComponent>;
    let de: DebugElement;
    let modalService: any;
    let store: any;
    let translateService: TranslateService;

    const dataAutomationCloseButton = '[data-automation="day-card-detail-close"]';
    const dataAutomationEditButton = '[data-automation="day-card-detail-edit"]';
    const dataAutomationNotesCallToAction = '[data-automation="day-card-detail-notes-call-to-action"]';
    const dataAutomationNotesShowMore = '[data-automation="day-card-detail-notes-show-more"]';

    const smallNote = 'Lorem ipsum';
    const largeNote = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
        'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullam.';
    const smallNoteWithBraekLines = 'L \n o \n r \n e \n m \n ipsum';
    const languageDEIdentifier = 'de';
    const languageENIdentifier = 'en';

    const dayCard: DayCard = MOCK_DAY_CARD_A;

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            DayCardDetailComponent,
            TextLinkComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: Store,
                useValue: new MockStore({
                    projectModule: {
                        dayCardSlice: {
                            currentItem: {
                                id: null,
                                requestStatus: RequestStatusEnum.empty,
                            },
                        },
                    },
                }),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardDetailComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);
        translateService = TestBed.inject(TranslateService);
        comp.dayCard = dayCard;
        fixture.detectChanges();
    });

    afterAll(() => {
        translateService.setDefaultLang(languageENIdentifier);
    });

    it('should emit close event when handleClose is called', () => {
        spyOn(comp.close, 'emit').and.callThrough();
        comp.handleClose();

        expect(comp.close.emit).toHaveBeenCalled();
    });

    it('should call handleClose when cross is clicked', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        de.query(By.css(dataAutomationCloseButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should call handleEdit when pencil is clicked', () => {
        spyOn(comp, 'handleEdit').and.callThrough();
        de.query(By.css(dataAutomationEditButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleEdit).toHaveBeenCalled();
    });

    it('should open edit day card modal with the right payload when handleEdit is called', () => {
        spyOn(modalService, 'open').and.callThrough();
        const focus = 'notes';
        const expectedResult = {
            id: ModalIdEnum.UpdateDayCard,
            data: {
                dayCard,
                focus,
            },
        };

        comp.handleEdit(focus);

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should allow edit when user has permission update day card and scheduler', () => {
        expect(de.query(By.css(dataAutomationEditButton))).not.toBeNull();
    });

    it('should not allow edit when user hasn\'t permission to update day card', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            permissions: Object.assign({}, dayCard.permissions, {
                canUpdate: false,
            }),
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationEditButton))).toBeNull();
    });

    it('should render notes call to action when day card no notes and user has permission to edit', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            notes: null,
        });

        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationNotesCallToAction))).not.toBeNull();
    });

    it('should not render show more for notes less than 180 chars long or 5 break lines', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            notes: smallNote,
        });

        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationNotesShowMore))).toBeNull();
    });

    it('should render show more for notes are larger than 180 chars long', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            notes: largeNote,
        });
        comp.handleTextLengthChanged(largeNote.length);

        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationNotesShowMore))).not.toBeNull();
    });

    it('should set the maxLength for the text-link to 180 when handleShowMoreNotes is called with false', () => {
        const expectedMaxLength = 180;

        comp.handleShowMoreNotes(false);

        expect(comp.maxLength).toBe(expectedMaxLength);
    });

    it('should set the maxLength for the text-link to 0 when handleShowMoreNotes is called with true', () => {
        const expectedMaxLength = 0;

        comp.handleShowMoreNotes(true);

        expect(comp.maxLength).toBe(expectedMaxLength);
    });

    it('should keep notes collapsed state when day card changes', () => {
        const expectedMaxLength = 0;

        comp.dayCard = Object.assign({}, dayCard, {
            notes: largeNote,
        });
        fixture.detectChanges();

        comp.handleShowMoreNotes(true);
        fixture.detectChanges();

        expect(comp.maxLength).toBe(expectedMaxLength);

        comp.dayCard = Object.assign({}, dayCard, {
            notes: smallNoteWithBraekLines,
        });
        fixture.detectChanges();

        expect(comp.maxLength).toBe(expectedMaxLength);
    });

    it('should translate day card date after a language change', () => {
        const dayCardDate = dayCard.date;
        const expectedBeforeLangChange = moment(dayCardDate).locale('en').format(DayCardDateFormatEnum.en);
        const expectedAfterLangChange = moment(dayCardDate).locale('de').format(DayCardDateFormatEnum.de);

        comp.dayCard = dayCard;
        comp.ngOnInit();

        expect(comp.dayCardInfo[1].text).toBe(expectedBeforeLangChange);

        translateService.setDefaultLang(languageDEIdentifier);

        expect(comp.dayCardInfo[1].text).toBe(expectedAfterLangChange);
    });

    it('should handle current day card request status when a request is in progress and set isLoading to TRUE', () => {
        store._value.projectModule.dayCardSlice.currentItem.requestStatus = RequestStatusEnum.progress;
        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should handle current day card request status when a request is not in progress and set isLoading to FALSE', () => {
        store._value.projectModule.dayCardSlice.currentItem.requestStatus = RequestStatusEnum.success;
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set correct options when user has permission delete day card', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            _links: {
                delete: {
                    href: '',
                },
            },
        });

        expect(getDropdownItem(DELETE_DAYCARD_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission delete day card', () => {
        comp.dayCard = Object.assign({}, dayCard, {
            permissions: Object.assign({}, dayCard.permissions, {
                canDelete: false,
            }),
        });

        expect(getDropdownItem(DELETE_DAYCARD_ITEM_ID)).toBeFalsy();
    });

    it('should call open on modalService when handleDelete is called and confirmCallback should dispatch right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const payload: DeleteDayCardPayload = {
            dayCardId: dayCard.id,
            taskId: dayCard.task.id,
        };
        const expectedResult = new DayCardActions.Delete.One(payload);
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleDropdownItemClicked(getDropdownItem(DELETE_DAYCARD_ITEM_ID));

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleDelete is called and cancelCallback should dispatch right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new DayCardActions.Delete.OneReset();
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleDropdownItemClicked(getDropdownItem(DELETE_DAYCARD_ITEM_ID));

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
