/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidatorFn
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {AttachmentHelper} from '../../../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../../../shared/misc/helpers/environment.helper';
import {GenericValidators} from '../../../../../../shared/misc/validation/generic.validators';
import {
    InputFilesComponent,
    InputFilesSize
} from '../../../../../../shared/ui/forms/input-files/input-files.component';
import {InputTextareaUserComponent} from '../../../../../../shared/ui/forms/input-textarea-user/input-textarea-user.component';
import {UserResource} from '../../../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveMessageResource} from '../../../../../project-common/api/messages/resources/save-message.resource';
import {MessageQueries} from '../../../../../project-common/store/messages/message.queries';

@Component({
    selector: 'ss-project-task-reply-capture',
    templateUrl: './project-task-reply-capture.component.html',
    styleUrls: ['./project-task-reply-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTaskReplyCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public topicId: string;

    @Input()
    public user?: ResourceReferenceWithPicture;

    @Input()
    public inputFilesSize: InputFilesSize;

    @Output()
    public submitForm: EventEmitter<SaveMessageResource> = new EventEmitter<SaveMessageResource>();

    @ViewChild('inputFiles', {static: true})
    public inputFiles: InputFilesComponent;

    @ViewChild('inputTextareaUser', {static: true})
    public inputTextareaUser: InputTextareaUserComponent;

    public maxCharacters = 320;

    public imageMaxSize: number;

    public imageMaxSizeInMb: number;

    public isLoading: boolean;

    public acceptedPattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    public focused = false;

    public isInputFilesVisible = false;

    public form: UntypedFormGroup;

    private _disposableSubscriptions = new Subscription();

    private _statusChangeSubscription = new Subscription();

    private _defaultValues: Record<string, string | Array<File>> = {
        content: '',
        files: [],
    };

    private _isSubmitting: boolean;

    constructor(private _attachmentHelper: AttachmentHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder,
                private _messageQueries: MessageQueries,
                private _userQueries: UserQueries) {
    }

    ngOnInit(): void {
        this._setImageMaxSize();
        this._setSubscriptions();
        this._setupForm();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public onBlur(): void {
        this.focused = false;
        this._changeDetectorRef.detectChanges();
    }

    public onChangeFiles(files: File[]): void {
        this.isInputFilesVisible = files.length > 0;
    }

    public onFocus(): void {
        this.focused = true;
        this._changeDetectorRef.detectChanges();
    }

    public onSubmitForm(): void {
        const {topicId} = this;
        const {content, files} = this.form.value;
        const message = new SaveMessageResource(
            topicId,
            content || null,
            files.length ? files : null);

        if (message.content === null && message.files === null) {
            return;
        }

        this._isSubmitting = true;
        this.submitForm.emit(message);
    }

    public openFinder(): void {
        this.inputFiles.openFinder();
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = requestStatus === RequestStatusEnum.progress;
            this._isSubmitting = requestStatus === RequestStatusEnum.progress;

            if (requestStatus === RequestStatusEnum.success) {
                this._resetForm();
            }

            this._changeDetectorRef.detectChanges();
        }
    }

    private _hasValues(): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {
            const {content, files} = group.value;

            return !content && (files && !files.length) ? {
                hasValues: {
                    valid: false,
                },
            } : null;
        };
    }

    private _resetForm(): void {
        this.form.reset();
        this._setupForm();
        this.isInputFilesVisible = false;
    }

    private _setImageMaxSize(): void {
        this.imageMaxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.imageMaxSize = this._attachmentHelper.convertMbToBytes(this.imageMaxSizeInMb);
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            content: [this._defaultValues.content,
                GenericValidators.isMaxLength(this.maxCharacters)],
            files: [this._defaultValues.files],
        }, {
            validators: this._hasValues(),
        });

        this._statusChangeSubscription.unsubscribe();
        this._statusChangeSubscription = this.form.statusChanges
            .pipe(distinctUntilChanged())
            .subscribe(() => this._changeDetectorRef.detectChanges());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._messageQueries
                .observeMessagesByTopicRequestStatus(this.topicId)
                .subscribe(requestStatus => this._handleRequestStatus(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe((user) => this._handleCurrentUser(user))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleCurrentUser(user: UserResource): void {
        const {id, firstName, lastName, _embedded} = user;

        this.user = new ResourceReferenceWithPicture(
            id,
            `${firstName} ${lastName}`,
            _embedded.profilePicture._links.small.href
        );
    }
}
