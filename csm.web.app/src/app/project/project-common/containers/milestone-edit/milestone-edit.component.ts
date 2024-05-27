/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {SaveMilestoneResource} from '../../api/milestones/resources/save-milestone.resource';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {
    MilestoneCaptureComponent,
    MilestoneFormData
} from '../milestone-capture/milestone-capture.component';

@Component({
    selector: 'ss-milestone-edit',
    templateUrl: './milestone-edit.component.html',
    styleUrls: ['./milestone-edit.component.scss']
})
export class MilestoneEditComponent implements OnInit, OnDestroy {
    /**
     * @description Emits when the capture is to be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter<null>();

    /**
     * @description Property with milestone capture component
     */
    @ViewChild('milestoneCapture', {static: true})
    public milestoneCapture: MilestoneCaptureComponent;

    /**
     * @description Property with information about loading status
     * @type {boolean}
     */
    public isLoading = false;

    /**
     * @description Property to define that the capture has the update mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    public defaultValues: Milestone;

    public focus: string;

    private _disposableSubscriptions = new Subscription();

    private _isSubmitting: boolean;

    private _milestoneId: string;

    private _milestone: Milestone;

    constructor(private _milestoneQueries: MilestoneQueries,
                private _modalService: ModalService,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setModalOptions();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(milestoneFormDate: MilestoneFormData): void {
        const {id, project, version} = this._milestone;
        const saveMilestone = SaveMilestoneResource.fromFormData(project.id, milestoneFormDate);

        this._isSubmitting = true;
        this._store.dispatch(new MilestoneActions.Update.One(id, saveMilestone, version));
    }

    public handleCancel(): void {
        this._isSubmitting = false;
        this.milestoneCapture.resetForm();
        this._store.dispatch(new MilestoneActions.Update.OneReset());
        this.onClose.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._milestoneQueries.observeMilestoneById(this._milestoneId)
                .pipe(first())
                .subscribe(milestone => this._setDefaultValues(milestone))
        );

        this._disposableSubscriptions.add(
            this._milestoneQueries.observeCurrentMilestoneRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setModalOptions(): void {
        const {milestoneId, focus} = this._modalService.currentModalData;

        this.focus = focus;
        this._milestoneId = milestoneId;
    }

    private _setDefaultValues(milestone: Milestone): void {
        this.defaultValues = milestone;
        this._milestone = milestone;
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = requestStatus === RequestStatusEnum.progress;

            if (requestStatus === RequestStatusEnum.success) {
                this.handleCancel();
            }
        }
    }
}
