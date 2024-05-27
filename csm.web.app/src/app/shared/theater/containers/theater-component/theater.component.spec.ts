/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {setEventKey} from '../../../../../test/helpers';
import {
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2,
    MOCK_ATTACHMENTS
} from '../../../../../test/mocks/attachments';
import {MockStore} from '../../../../../test/mocks/store';
import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {
    REDUCER,
    State
} from '../../../../app.reducers';
import {AttachmentResource} from '../../../../project/project-common/api/attachments/resources/attachment.resource';
import {AttachmentActions} from '../../../../project/project-common/store/attachments/attachment.actions';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {BlobService} from '../../../rest/services/blob.service';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {TheaterService} from '../../api/theater.service';
import {TheaterModule} from '../../theater.module';
import {TheaterComponent} from './theater.component';

describe('Theater Component', () => {
    let fixture: ComponentFixture<TheaterComponent>;
    let comp: TheaterComponent;
    let de: DebugElement;
    let blobService: any;
    let theaterService: TheaterService;
    let modalService: ModalService;
    let store: Store<State>;

    const attachments: AttachmentResource[] = MOCK_ATTACHMENTS;
    const attachmentId: string = attachments[0].id;
    const clickEvent: Event = new Event('click');
    const keyupEvent: KeyboardEvent = new KeyboardEvent('keyup');

    const dataAutomationAttachmentDeleteIconSelector = '[data-automation="attachment-delete-option"]';
    const dataAutomationAttachmentDownloadLinkSelector = '[data-automation="attachment-download-option"]';

    const getDownloadLink = () => de.query(By.css(dataAutomationAttachmentDownloadLinkSelector));

    const moduleDef: TestModuleMetadata = {
        imports: [
            TheaterModule,
            StoreModule.forRoot(REDUCER),
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            AttachmentHelper,
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            },
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate'])
            },
        ]
    };
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TheaterComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);
        theaterService = TestBed.inject(TheaterService);
        blobService = TestBed.inject(BlobService);
    });

    beforeEach(() => {
        comp.ngOnInit();
    });

    afterEach(() => {
        comp.ngOnDestroy();
    });

    it('should not show theater when attachments or attachmentId are not provided', () => {
        theaterService.open([], null);
        comp.ngOnInit();

        expect(comp.theaterCanBeShown()).toBeFalsy();
    });

    it('should show theater when attachments and attachmentId are provided', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        expect(comp.theaterCanBeShown()).toBeTruthy();
    });

    it('should jump to last attachment when is on first and navigate to previous', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();
        comp.previousAttachment();

        expect(comp.currentAttachmentIndex).toBe(attachments.length - 1);
    });

    it('should jump to first attachment when is in last and navigate to next', () => {
        theaterService.open(attachments, attachments[attachments.length - 1].id);
        comp.ngOnInit();
        comp.nextAttachment();

        expect(comp.currentAttachmentIndex).toBe(0);
    });

    it('should increment attachment index by one', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();
        comp.nextAttachment();

        expect(comp.currentAttachmentIndex).toBe(1);
    });

    it('should decrement attachment index by one', () => {
        theaterService.open(attachments, attachments[1].id);
        comp.ngOnInit();
        comp.previousAttachment();

        expect(comp.currentAttachmentIndex).toBe(0);
    });

    it('should close theater when press Tab', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        setEventKey(keyupEvent, KeyEnum.Tab);
        comp.onKeyup(keyupEvent);

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should close theater when press ESC', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        setEventKey(keyupEvent, KeyEnum.Escape);
        comp.onKeyup(keyupEvent);

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should call "previousAttachment" when left arrow is pressed', () => {
        spyOn(comp, 'previousAttachment').and.callThrough();
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        setEventKey(keyupEvent, KeyEnum.ArrowLeft);
        comp.onKeyup(keyupEvent);

        expect(comp.previousAttachment).toHaveBeenCalled();
    });

    it('should call "nextAttachment" when right arrow is pressed', () => {
        spyOn(comp, 'nextAttachment').and.callThrough();
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        setEventKey(keyupEvent, KeyEnum.ArrowRight);
        comp.onKeyup(keyupEvent);

        expect(comp.nextAttachment).toHaveBeenCalled();
    });

    it('should toggle information panel', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        expect(comp.isInformationPanelOpen).toBeTruthy();

        comp.toggleInformationPanel();

        expect(comp.isInformationPanelOpen).toBeFalsy();
    });

    it('should retrieve correct CSS class when information panel is opened', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        const expectedResult = {
            'ss-theater__information--active': true,
        };
        const result = comp.getAsideClasses();

        expect(result).toEqual(expectedResult);
    });

    it('should retrieve correct CSS class when information panel is closed', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();
        comp.toggleInformationPanel();

        const expectedResult = {
            'ss-theater__information--active': false,
        };
        const result = comp.getAsideClasses();

        expect(result).toEqual(expectedResult);
    });

    it('should ensure that the attachment href returns with original instead of data to download', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        const attachmentHref = comp.currentOriginalAttachmentHref;

        expect(attachmentHref).not.toContain('data');
        expect(attachmentHref).toContain('original');
    });

    it('should ensure that the attachment href returns with data instead of original to display', () => {
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();

        const attachmentHref = comp.currentCompressedAttachmentHref;

        expect(attachmentHref).not.toContain('original');
        expect(attachmentHref).toContain('data');
    });

    it('should call handleDownload when the download link is clicked', () => {
        spyOn(comp, 'handleDownload').and.callThrough();
        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();
        fixture.detectChanges();

        getDownloadLink().nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleDownload).toHaveBeenCalled();
    });

    it('should call open on modalService when handleDelete is called and cancelCallback should dispatch the right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new AttachmentActions.Delete.OneReset();

        comp.handleDelete();
        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleDelete is called and confirmedCallback should dispatch the right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const payload: string = attachmentId;
        const expectedResult = new AttachmentActions.Delete.One(payload);

        theaterService.open(attachments, attachmentId);
        comp.ngOnInit();
        comp.handleDelete();
        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should close the theater view after attachment has been deleted', () => {
        spyOn(theaterService, 'close').and.callThrough();

        comp.handleDelete();
        modalService.currentModalData.completeCallback();

        expect(theaterService.close).toHaveBeenCalled();
    });

    it('should not render delete button if the user does not have permissions to delete attachment', () => {
        theaterService.open([MOCK_ATTACHMENT_1], MOCK_ATTACHMENT_1.id);
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationAttachmentDeleteIconSelector))).toBeNull();
    });

    it('should render delete button if the user has permissions to delete attachment', () => {
        theaterService.open([MOCK_ATTACHMENT_2], MOCK_ATTACHMENT_2.id);
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationAttachmentDeleteIconSelector))).not.toBeNull();
    });

});
