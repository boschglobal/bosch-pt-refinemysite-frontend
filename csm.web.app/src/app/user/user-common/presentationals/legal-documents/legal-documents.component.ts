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
    SimpleChanges,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
} from '@angular/forms';

import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {LegalDocumentResource} from '../../../api/resources/user-legal-documents.resource';
import {LegalDocumentTypeEnum} from '../../enums/legal-document-type.enum';

interface LegalDocumentsForm {
    [LegalDocumentTypeEnum.TermsAndConditions]?: FormControl<boolean>;
    [LegalDocumentTypeEnum.Eula]?: FormControl<boolean>;
}

@Component({
    selector: 'ss-legal-documents',
    templateUrl: './legal-documents.component.html',
    styleUrls: ['./legal-documents.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalDocumentsComponent implements OnChanges {

    @Input()
    public legalDocuments: LegalDocumentResource[];

    @Output()
    public accept: EventEmitter<string[]> = new EventEmitter<string[]>();

    @Output()
    public delay: EventEmitter<void> = new EventEmitter<void>();

    public form: FormGroup<LegalDocumentsForm>;

    constructor(private _formBuilder: FormBuilder) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('legalDocuments')) {
            this._setForm();
        }
    }

    public handleAccept(): void {
        const ids = this.legalDocuments.map(({id}) => id);

        this.accept.emit(ids);
    }

    public handleDelay(): void {
        this.delay.emit();
    }

    private _setForm(): void {
        const controls: LegalDocumentsForm = this.legalDocuments.reduce((acc, legalDocument) => ({
            ...acc,
            [legalDocument.type]: new FormControl(false, GenericValidators.isChecked()),
        }), {});

        this.form = this._formBuilder.group({...controls});
    }
}
