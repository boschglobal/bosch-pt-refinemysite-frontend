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
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidatorFn
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AttachmentHelper} from '../../../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../../../shared/misc/helpers/environment.helper';
import {GenericValidators} from '../../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../../shared/misc/validation/generic.warnings';
import {InputTextareaUserComponent} from '../../../../../../shared/ui/forms/input-textarea-user/input-textarea-user.component';
import {SaveTopicResource} from '../../../../../project-common/api/topics/resources/save-topic.resource';

@Component({
    selector: 'ss-project-task-topic-capture',
    templateUrl: './project-task-topic-capture.component.html',
    styleUrls: ['./project-task-topic-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTaskTopicCaptureComponent implements OnInit {

    @Input()
    public isSubmitting: boolean;

    @Input()
    public isCollapsed = true;

    @Input()
    public user: ResourceReferenceWithPicture;

    @Output()
    public canceled: EventEmitter<null> = new EventEmitter();

    @Output()
    public focused: EventEmitter<null> = new EventEmitter();

    @Output()
    public submitted: EventEmitter<SaveTopicResource> = new EventEmitter<SaveTopicResource>();

    @ViewChild(InputTextareaUserComponent, {static: true})
    public descriptionInput: InputTextareaUserComponent;

    public form: UntypedFormGroup;

    public acceptedPattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    public imageMaxSize: number;

    public imageMaxSizeInMb: number;

    public maxCharacters = 320;

    private _defaultValues: any = {
        description: '',
        files: [],
        criticality: false,
    };

    private _statusChangeSubscription = new Subscription();

    constructor(private _attachmentHelper: AttachmentHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setImageMaxSize();
        this._setupForm();
        this._setFocus();
    }

    public handleCancel(): void {
        this.resetForm();
        this.canceled.emit();
    }

    public onSubmitForm(): void {
        this.submitted.emit(this.form.value);
    }

    public resetForm(): void {
        if (this.form) {
            this.form.reset();
        }
        this._setupForm();
    }

    public handleFocus(): void {
        this.focused.emit();
    }

    private _setImageMaxSize(): void {
        this.imageMaxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.imageMaxSize = this._attachmentHelper.convertMbToBytes(this.imageMaxSizeInMb);
    }

    private _setFocus(): void {
        if (!this.isCollapsed) {
            this.descriptionInput.setFocus();
        }
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            description: [this._defaultValues.description, [
                GenericValidators.isMaxLength(this.maxCharacters),
                GenericWarnings.isCharLimitReached(this.maxCharacters),
            ]],
            files: [this._defaultValues.files],
            criticality: [this._defaultValues.criticality],
        }, {
            validators: this._hasValues(),
        });

        this._statusChangeSubscription.unsubscribe();
        this._statusChangeSubscription = this.form.statusChanges
            .pipe(distinctUntilChanged())
            .subscribe(() => this._changeDetectorRef.detectChanges());
    }

    private _hasValues(): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {

            const {description, files} = group.value;

            return !description && (files && !files.length) ? {
                hasValues: {
                    valid: false,
                },
            } : null;
        };
    }
}
