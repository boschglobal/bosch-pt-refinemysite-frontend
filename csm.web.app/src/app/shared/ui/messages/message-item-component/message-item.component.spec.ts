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
import {flatten} from 'lodash';

import {
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_FILES
} from '../../../../../test/mocks/messages';
import {MOCK_NEW_D} from '../../../../../test/mocks/news';
import {NewsResource} from '../../../../project/project-common/api/news/resources/news.resource';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {TheaterService} from '../../../theater/api/theater.service';
import {TranslationModule} from '../../../translation/translation.module';
import {MenuItem} from '../../menus/menu-list/menu-list.component';
import {
    DELETE_MESSAGE_ITEM_ID,
    MessageItemComponent
} from './message-item.component';
import {MessageItemModel} from './message-item.model';

describe('Message Item Component', () => {
    let fixture: ComponentFixture<MessageItemComponent>;
    let comp: MessageItemComponent;
    let theaterService: jasmine.SpyObj<TheaterService>;
    let de: DebugElement;
    let el: HTMLElement;

    const currentLang = 'en';
    const news: NewsResource[] = [
        {...MOCK_NEW_D, context: new ObjectIdentifierPair(ObjectTypeEnum.Message, MOCK_MESSAGE_1.id)},
    ];
    const messageFiles: MessageItemModel = MessageItemModel.fromMessageResource(MOCK_MESSAGE_FILES, [], currentLang);
    const messageContent: MessageItemModel = MessageItemModel.fromMessageResource(MOCK_MESSAGE_1, [], currentLang);
    const oldMessage: MessageItemModel = MessageItemModel.fromMessageResource(MOCK_MESSAGE_1, [], currentLang);
    const newMessage: MessageItemModel = MessageItemModel.fromMessageResource(MOCK_MESSAGE_1, news, currentLang);
    const messageWithDeletePermission: MessageItemModel = {
        ...messageContent,
        canDelete: true,
    };
    const messageWithoutDeletePermission: MessageItemModel = {
        ...messageContent,
        canDelete: false,
    };

    const dataAutomationNewSelector = '[data-automation="message-item-new"]';

    const getElement = (element: string) => el.querySelector(element);

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [
            MessageItemComponent,
        ],
        providers: [
            {
                provide: TheaterService,
                useValue: jasmine.createSpyObj('TheaterService', ['open']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageItemComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        theaterService = TestBed.inject(TheaterService) as jasmine.SpyObj<TheaterService>;
    });

    it('should render news HTML when message is new', () => {
        comp.message = newMessage;
        fixture.detectChanges();

        expect(getElement(dataAutomationNewSelector)).toBeTruthy();
    });

    it('should not render news HTML when message is not new', () => {
        comp.message = oldMessage;
        fixture.detectChanges();

        expect(getElement(dataAutomationNewSelector)).toBeFalsy();
    });

    it('should validate that open theater is called', () => {
        const index = '0';
        const attachments = messageFiles.attachments;
        const attachmentId = attachments[index].id;

        comp.message = messageFiles;
        fixture.detectChanges();

        comp.openTheater(index);

        expect(theaterService.open).toHaveBeenCalledWith(attachments, attachmentId);
    });

    it('should set correct options when user has permission to delete message', () => {
        comp.message = messageWithDeletePermission;
        comp.ngOnChanges({message: null});

        expect(getDropdownItem(DELETE_MESSAGE_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission to delete message', () => {
        comp.message = messageWithoutDeletePermission;
        comp.ngOnChanges({message: null});

        expect(getDropdownItem(DELETE_MESSAGE_ITEM_ID)).toBeFalsy();
    });

    it('should emit delete event when delete option is called', () => {
        spyOn(comp.delete, 'emit').and.callThrough();

        comp.message = messageWithDeletePermission;
        comp.ngOnChanges({message: null});
        comp.handleDropdownItemClicked(getDropdownItem(DELETE_MESSAGE_ITEM_ID));

        expect(comp.delete.emit).toHaveBeenCalledWith(messageWithDeletePermission.id);
    });

    it('should set the pictureLinks with the links from the attachments when message input changes', () => {
        const expectedLinks: string[] = messageFiles.attachments.map(attachment => attachment._links.preview.href);

        comp.message = messageFiles;
        comp.ngOnChanges({message: null});

        expect(comp.pictureLinks).toEqual(expectedLinks);
    });
});
