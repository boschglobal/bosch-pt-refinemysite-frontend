/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {
    JobCard,
    JobCardData
} from '../../../../project/project-common/models/job-card/job-card';
import {BlobExport} from '../../../misc/api/datatypes/blob-export.datatype';
import {BlobService} from '../../../rest/services/blob.service';

@Component({
    selector: 'ss-job-card',
    templateUrl: './job-card.component.html',
    styleUrls: ['./job-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardComponent implements OnChanges {

    @Input()
    public card: JobCard;

    @Output()
    public downloadTriggered: EventEmitter<string> = new EventEmitter();

    public cardClasses: { [key: string]: boolean };

    constructor(private _blobService: BlobService,
                private _router: Router) {
    }

    ngOnChanges(): void {
        this._setCardClasses();
    }

    public handleReroute(): void {
        if (this.card.data.rerouteUrl) {
            this._router.navigate([this.card.data.rerouteUrl]);
        }
    }

    public handleDownload(): () => Observable<BlobExport> {
        return () => this._blobService.getBlob(this.card.data.artifactUrl)
            .pipe(
                map((blob) => new BlobExport(blob, this.card.data.fileName)));
    }

    public handleDownloadFinished(): void {
        this.downloadTriggered.emit(this.card.id);
    }

    private _setCardClasses(): void {
        const cardData: JobCardData = this.card.data;

        this.cardClasses = {
            ['ss-job-card--clickable']: !!cardData.rerouteUrl,
            ['ss-job-card--not-seen']: !cardData.read,
        };
    }
}
