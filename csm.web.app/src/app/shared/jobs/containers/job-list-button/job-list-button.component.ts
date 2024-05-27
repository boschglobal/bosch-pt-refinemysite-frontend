/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    state,
    style,
    transition,
    trigger,
    useAnimation
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {
    bulgeInAnimation,
    bulgeInSvgCircleAnimation,
    bulgeOutAnimation,
    bulgeOutSvgCircleAnimation
} from '../../../animation/bulge/bulge.animation';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {ButtonStyle} from '../../../ui/button/button.component';
import {FlyoutService} from '../../../ui/flyout/service/flyout.service';
import {JobResource} from '../../api/resources/job.resource';
import {JobActions} from '../../store/job.actions';
import {JobQueries} from '../../store/job.queries';

export const JOB_LIST_BUTTON_ANIMATED_STATE = 'animated-state';

@Component({
    selector: 'ss-job-list-button',
    templateUrl: './job-list-button.component.html',
    styleUrls: ['./job-list-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('bulgeButtonIconRegular', [
            transition(`void => ${JOB_LIST_BUTTON_ANIMATED_STATE}`, [
                useAnimation(bulgeInAnimation, {
                    params: {
                        timing: '800ms',
                    },
                }),
            ]),
            transition(`${JOB_LIST_BUTTON_ANIMATED_STATE} => void`, [
                useAnimation(bulgeOutAnimation),
            ]),
        ]),
        trigger('bulgeButtonIconStrong', [
            transition(':enter', [
                useAnimation(bulgeInAnimation),
            ]),
            transition(':leave', [
                useAnimation(bulgeOutAnimation),
            ]),
        ]),
        trigger('bulgeBadge', [
            state('badgeBulgeIn', style({r: '24px'})),
            state('badgeBulgeOut', style({r: '0px'})),
            transition('badgeBulgeOut => badgeBulgeIn', [
                useAnimation(bulgeInSvgCircleAnimation),
            ], {
                params: {
                    rInit: '18px',
                    rMid: '30px',
                    rFinal: '24px',
                },
            }),
            transition('badgeBulgeIn => badgeBulgeOut', [
                useAnimation(bulgeOutSvgCircleAnimation),
            ], {
                params: {
                    rInit: '24px',
                    rMid: '28px',
                    rFinal: '24px',
                },
            }),
        ]),
    ],
})
export class JobListButtonComponent implements OnInit, OnDestroy {

    public buttonAnimationState: string;

    public buttonStyle: ButtonStyle = 'tertiary-grey';

    public isJobCardListLoading = false;

    public jobs: JobResource[] = [];

    public jobCardListFlyoutId = 'ss-job-card-list-flyout';

    public jobServiceUnavailable = false;

    public hasJobNews = false;

    public hasJobsRunning = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService,
                private _jobQueries: JobQueries,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestJobList();
        this.buttonAnimationState = JOB_LIST_BUTTON_ANIMATED_STATE;
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public closeJobCardListFlyout(): void {
        this._flyoutService.close(this.jobCardListFlyoutId);
    }

    public handleJobCardClick(cardId: string): void {
        this._store.dispatch(new JobActions.Set.JobAsRead(cardId));
    }

    private _requestJobList(): void {
        this._store.dispatch(new JobActions.Request.All());
    }

    private _handleJobListRequestStatus(status: RequestStatusEnum): void {
        this.isJobCardListLoading = status === RequestStatusEnum.progress;

        this.jobServiceUnavailable = status === RequestStatusEnum.error && this.jobs.length === 0;
    }

    private _setButtonStyle(): void {
        this.buttonStyle = this.hasJobsRunning ? 'tertiary-light-blue' : 'tertiary-grey';
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._jobQueries.observeJobs()
                .subscribe(jobs => this.jobs = jobs));

        this._disposableSubscriptions.add(
            this._jobQueries.observeJobListRequestStatus()
                .subscribe(status => this._handleJobListRequestStatus(status)));

        this._disposableSubscriptions.add(
            this._jobQueries.observeHasJobsRunning()
                .subscribe(hasJobsRunning => {
                    this.hasJobsRunning = hasJobsRunning;
                    this._setButtonStyle();
                    this._changeDetectorRef.detectChanges();
                }));

        this._disposableSubscriptions.add(
            this._jobQueries.observeJobListHasUpdates()
                .subscribe(hasUpdates => {
                    this.hasJobNews = hasUpdates;
                    this._changeDetectorRef.detectChanges();
                }));

        this._disposableSubscriptions.add(
            this._flyoutService.openEvents
                .pipe(
                    filter(flyoutId => flyoutId === this.jobCardListFlyoutId))
                .subscribe(() => this._requestJobList()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
