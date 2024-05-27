/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    TemplateRef,
    ViewChild
} from '@angular/core';

import {Chip} from './chip.component';

@Component({
    selector: 'ss-chip-test',
    templateUrl: './chip.test.component.html',
    styles: [
        'ss-chip {display: inline-block}',
        ':host {padding: 8px; display: block}',
        '.craft {width: 16px; height: 16px; margin: 0 4px 0 10px}',
    ],
})
export class ChipTestComponent {

    @ViewChild('customVisualContentTemplate', {static: true})
    public customVisualContentTemplate: TemplateRef<any>;

    @Input()
    public set item(chip: Chip) {
        this._item = chip;
        this.injectTemplate();
    }

    public get item(): Chip {
        return this._item;
    }

    private _item: Chip;

    public injectTemplate(): void {
        if (this._item?.customVisualContent) {
            this._item = {
                ...this._item,
                customVisualContent: {
                    ...this._item.customVisualContent,
                    template: this.customVisualContentTemplate,
                },
            };
        }
    }

    public remove(chip: Chip): void {
    }
}
