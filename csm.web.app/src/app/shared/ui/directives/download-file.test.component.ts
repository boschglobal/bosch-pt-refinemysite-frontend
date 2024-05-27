/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit
} from '@angular/core';
import {Observable} from 'rxjs';

import {BlobExport} from '../../misc/api/datatypes/blob-export.datatype';

@Component({
    templateUrl: './download-file.test.component.html'
})
export class DownloadFileTestComponent implements OnInit {

    public downloadSubscription: () => Observable<BlobExport> | Observable<BlobExport>;

    public downloadDisabled = false;

    ngOnInit() {
        this.downloadSubscription = () => new Observable<BlobExport>();
    }

    public downloadFinish(): void {
    }

    public downloadError(): void {
    }

    public downloadStart(): void {
    }

    public handleDownload(): void {
    }

}
