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
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {SaveProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/save-project-import-analyze.resource';

export type ProjectImportCraftCapture = Pick<SaveProjectImportAnalyzeResource, 'craftColumn'>;

@Component({
    selector: 'ss-project-import-craft-capture',
    templateUrl: './project-import-craft-capture.component.html',
    styleUrls: ['./project-import-craft-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportCraftCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue(defaultValue: ProjectImportCraftCapture) {
        if (defaultValue && !isEqual(defaultValue, this.form?.value)) {
            this._defaultValue = defaultValue;
            this._setupForm();
        }
    }

    @Input()
    public options: SelectOption[] = [];

    @Output()
    public valueChanged = new EventEmitter<ProjectImportCraftCapture>();

    public form: UntypedFormGroup;

    private _defaultValue: ProjectImportCraftCapture = {
        craftColumn: null,
    };

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            craftColumn: [this._defaultValue.craftColumn],
        });

        this._unsetSubscriptions();
        this._setSubscriptions();

        this.form.updateValueAndValidity();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions = new Subscription();
        this._disposableSubscriptions.add(
            this.form.valueChanges
                .pipe(distinctUntilChanged(isEqual))
                .subscribe((value: ProjectImportCraftCapture) => this.valueChanged.emit(value)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
