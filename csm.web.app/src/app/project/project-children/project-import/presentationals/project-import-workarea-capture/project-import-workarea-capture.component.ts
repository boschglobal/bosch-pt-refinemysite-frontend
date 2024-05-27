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
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    startWith,
} from 'rxjs/operators';

import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {SaveProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/save-project-import-analyze.resource';

export type ProjectImportWorkareaCapture = Pick<SaveProjectImportAnalyzeResource, 'readWorkAreasHierarchically' | 'workAreaColumn'>;

@Component({
    selector: 'ss-project-import-workarea-capture',
    templateUrl: './project-import-workarea-capture.component.html',
    styleUrls: ['./project-import-workarea-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportWorkareaCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue(defaultValue: ProjectImportWorkareaCapture) {
        if (defaultValue && !isEqual(defaultValue, this.form?.value)) {
            this._defaultValue = defaultValue;
            this._setupForm();
        }
    }

    @Input()
    public options: SelectOption[] = [];

    @Output()
    public valueChanged = new EventEmitter<ProjectImportWorkareaCapture>();

    public form: UntypedFormGroup;

    private _defaultValue: ProjectImportWorkareaCapture = {
        readWorkAreasHierarchically: false,
        workAreaColumn: null,
    };

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: UntypedFormBuilder) {}

    ngOnInit() {
        this._setupForm();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    private _handleWorkAreasHierarchicallyValueChange(value: boolean): void {
        if (value) {
            this.form.get('workAreaColumn').disable();
        } else {
            this.form.get('workAreaColumn').enable();
        }

        this._changeDetectorRef.detectChanges();
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            readWorkAreasHierarchically: [this._defaultValue.readWorkAreasHierarchically],
            workAreaColumn: [this._defaultValue.workAreaColumn],
        });

        this._unsetSubscriptions();
        this._setSubscriptions();

        this.form.updateValueAndValidity();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions = new Subscription();
        this._disposableSubscriptions.add(
            this.form.get('readWorkAreasHierarchically').valueChanges
                .pipe(startWith(this._defaultValue.readWorkAreasHierarchically))
                .subscribe(value => this._handleWorkAreasHierarchicallyValueChange(value)));

        this._disposableSubscriptions.add(
            this.form.valueChanges
                .pipe(
                    map(({readWorkAreasHierarchically, workAreaColumn}: ProjectImportWorkareaCapture) => ({
                        readWorkAreasHierarchically,
                        ...readWorkAreasHierarchically ? {} : {workAreaColumn},
                    })),
                    distinctUntilChanged(isEqual),
                )
                .subscribe((value: ProjectImportWorkareaCapture) => this.valueChanged.emit(value)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
