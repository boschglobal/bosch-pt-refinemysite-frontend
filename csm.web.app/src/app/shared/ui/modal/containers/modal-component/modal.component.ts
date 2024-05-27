/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    fromEvent,
    Subscription
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {KeyEnum} from '../../../../misc/enums/key.enum';
import {
    BackdropClickEventTypeEnum,
    BackdropClickHelper,
} from '../../../../misc/helpers/backdrop-click.helper';
import {ModalService} from '../../api/modal.service';

export interface ModalInterface {
    id: string;
    data: any;
}

@Component({
    selector: 'ss-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy {

    /**
     * @description Input to define whether modal is visible or not
     */
    @Input()
    public isOpened: boolean;

    /**
     * @description Input to define the title of modal
     */
    @Input()
    public title: string;

    /**
     * @description Input to define the id of modal
     */
    @Input()
    public id: string;

    @Input()
    public size: ModalSize;

    @Input()
    public closeable = true;

    @ContentChild('body', {static: true})
    public body: TemplateRef<any>;

    @ContentChild('footer', {static: true})
    public footer: TemplateRef<any>;

    /**
     * @description Emits when header cross is clicked
     * @type {EventEmitter<void>}
     */
    @Output()
    public close: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('modalContent')
    public modalContent: ElementRef;

    public modal: ModalInterface = {
        id: '',
        data: '',
    };

    private _openSubscriptions = new Subscription();

    private _subscription: Subscription;

    constructor(private _backdropClickHelper: BackdropClickHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService) {
    }

    ngOnInit() {
        this._setSubscription();
    }

    ngOnDestroy() {
        this._unsetSubscription();
    }

    /**
     * @description Method to be called to specify intention of closing the modal
     */
    public handleClose(): void {
        this.close.emit();
        this._modalService.close();
    }

    private _setSubscription(): void {
        this._subscription = this._modalService.observeOpenSubject()
            .subscribe((modal: ModalInterface) => {
                this.modal = modal;
                this._toggleOpenSubscriptions();
                this._changeDetectorRef.detectChanges();
            });
    }

    private _unsetSubscription(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
        this._unsetOpenSubscriptions();
    }

    private _setOpenSubscriptions(): void {
        this._openSubscriptions = new Subscription();

        this._openSubscriptions.add(
            fromEvent(window, 'keyup')
                .pipe(
                    filter((event: KeyboardEvent) => this.closeable && event.key === KeyEnum.Escape),
                ).subscribe((event: KeyboardEvent) => {
                    this.handleClose();
                    event.preventDefault();
                    event.stopPropagation();
                }));

        this._openSubscriptions.add(
            this._backdropClickHelper.observe([BackdropClickEventTypeEnum.MouseDown],
                (event: Event) => this.closeable && !this.modalContent.nativeElement.contains(event.target))
                .subscribe(() => this.handleClose()));
    }

    private _unsetOpenSubscriptions(): void {
        this._openSubscriptions.unsubscribe();
    }

    private _toggleOpenSubscriptions(): void {
        if (this.isOpened || this.modal.id === this.id) {
            this._setOpenSubscriptions();
        } else {
            this._unsetOpenSubscriptions();
        }
    }
}

export type ModalSize = 'small' | 'medium' | 'large' | 'dialog';
