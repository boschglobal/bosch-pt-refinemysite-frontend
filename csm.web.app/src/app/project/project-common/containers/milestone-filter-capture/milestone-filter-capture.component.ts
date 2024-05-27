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
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {
    isEqual,
    partition
} from 'lodash';
import {
    BehaviorSubject,
    combineLatest,
    Subscription,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    startWith,
} from 'rxjs/operators';

import {CollapsibleSelectValue} from '../../../../shared/ui/collapsible-select/collapsible-select.component';
import {InputMultipleSelectOption} from '../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {
    MilestoneTypeEnum,
    MilestoneTypeEnumHelper
} from '../../enums/milestone-type.enum';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';

@Component({
    selector: 'ss-milestone-filter-capture',
    templateUrl: './milestone-filter-capture.component.html',
    styleUrls: ['./milestone-filter-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneFilterCaptureComponent implements OnInit, OnChanges, OnDestroy {

    @Input()
    public set defaultValues(value: MilestoneFilterFormData) {
        const selectedMilestoneTypes = value.types.filter(type => type !== MilestoneTypeEnum.Craft);
        const selectedIds = [...selectedMilestoneTypes, ...(value.projectCraftIds || [])];

        this.form.controls.selectedIds.setValue(selectedIds);
    }

    @Input()
    public emitValueChanged: boolean;

    @Input()
    public useCriteria = false;

    @Output()
    public valueChanged = new EventEmitter<void>();

    @ViewChild('milestoneMarker', {static: true})
    public milestoneMarker: TemplateRef<any>;

    public collapsibleSelectValue: CollapsibleSelectValue = false;

    public form = this._formBuilder.group({
        selectedIds: new FormControl<string[]>([]),
    });

    public options: InputMultipleSelectOption[] = [];

    private _onlyCollapsibleSelectValueChanged = new BehaviorSubject<void>(null);

    private _disposableSubscriptions: Subscription = new Subscription();

    private _projectCrafts: ProjectCraftResource[] = [];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _projectCraftQueries: ProjectCraftQueries,
        private _translateService: TranslateService) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.defaultValues || changes.useCriteria) {
            this._handleDefaultValuesChange();
        }
    }

    ngOnDestroy(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    public getFormValue(): MilestoneFilterFormData {
        const values = this.form.controls.selectedIds.value;

        const [types, projectCraftIds] =
            partition(values, item => item === MilestoneTypeEnum.Investor || item === MilestoneTypeEnum.Project);

        const returnValue: MilestoneFilterFormData = {
            types: types as MilestoneTypeEnum[],
        };

        if (projectCraftIds.length > 0) {
            returnValue.projectCraftIds = projectCraftIds;
            returnValue.types.push(MilestoneTypeEnum.Craft);
        }

        return returnValue;
    }

    public getUseCriteria(): boolean {
        return !!this.collapsibleSelectValue;
    }

    private _handleChange(): void {
        this._computeCollapsibleSelectValue();
        this._changeDetectorRef.detectChanges();
    }

    private _handleDefaultValuesChange(): void {
        if (this.useCriteria === true) {
            this._computeCollapsibleSelectValue();
        } else {
            this._setCollapsibleSelectValue(false);
        }
    }

    public handleSelect(selected: boolean): void {
        this.form.controls.selectedIds.setValue([], {emitEvent: false});
        this._setCollapsibleSelectValue(selected);
        this._onlyCollapsibleSelectValueChanged.next();
    }

    private _computeCollapsibleSelectValue(): void {
        const values = this.form.controls.selectedIds.value;

        if (values.length === 0 || values.length === this._projectCrafts.length + 2) {
            this._setCollapsibleSelectValue(true);
        } else {
            this._setCollapsibleSelectValue('indeterminate');
        }
    }

    private _setCollapsibleSelectValue(value: CollapsibleSelectValue): void {
        this.collapsibleSelectValue = value;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectCraftQueries.observeCraftsSortedByName()
                .subscribe((crafts) => {
                    this._setProjectCrafts(crafts);
                    this._setMultipleSelectOptions();
                    this._handleDefaultValuesChange();
                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this.form.valueChanges
                .pipe(distinctUntilChanged(isEqual))
                .subscribe(() => this._handleChange())
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._onlyCollapsibleSelectValueChanged,
                this.form.valueChanges.pipe(startWith(null)),
            ]).pipe(
                filter(() => this.emitValueChanged),
                map(() => [this.form.value, this.collapsibleSelectValue]),
                distinctUntilChanged(isEqual),
            ).subscribe(() => this.valueChanged.emit())
        );
    }

    private _setProjectCrafts(crafts: ProjectCraftResource[]): void {
        this._projectCrafts = crafts;
    }

    private _setMultipleSelectOptions(): void {
        const craftOptions: InputMultipleSelectOption[] = this._projectCrafts
            .map(craft => ({
                id: craft.id,
                text: craft.name,
                customVisualContent: {
                    data: {
                        type: MilestoneTypeEnum.Craft,
                        color: craft.color,
                    },
                    template: this.milestoneMarker,
                },
            }));

        if (craftOptions.length > 0) {
            craftOptions[0].groupText = this._translateService.instant('Generic_CraftsLabel');
            craftOptions[0].separator = true;
        }

        this.options = [
            {
                id: MilestoneTypeEnum.Investor,
                text: this._translateService.instant(MilestoneTypeEnumHelper.getLabelByValue(MilestoneTypeEnum.Investor)),
                customVisualContent: {
                    data: {
                        type: MilestoneTypeEnum.Investor,
                    },
                    template: this.milestoneMarker,
                },
            },
            {
                id: MilestoneTypeEnum.Project,
                text: this._translateService.instant(MilestoneTypeEnumHelper.getLabelByValue(MilestoneTypeEnum.Project)),
                customVisualContent: {
                    data: {
                        type: MilestoneTypeEnum.Project,
                    },
                    template: this.milestoneMarker,
                },
            },
            ...craftOptions,
        ];

        this._changeDetectorRef.detectChanges();
    }
}

export interface MilestoneFilterFormData {
    types: MilestoneTypeEnum[];
    projectCraftIds?: string[];
}
