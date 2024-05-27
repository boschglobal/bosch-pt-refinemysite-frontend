/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AfterContentInit,
    Component,
    ContentChildren,
    EventEmitter,
    Output,
    QueryList
} from '@angular/core';

import {TabPanelComponent} from '../tab-panel/tab-panel.component';

@Component({
    selector: 'ss-tab-panels',
    templateUrl: './tab-panels.component.html',
    styleUrls: ['./tab-panels.component.scss'],
})
export class TabPanelsComponent implements AfterContentInit {
    /**
     * @description Holds the TabPanelComponent passed in as children
     */
    @ContentChildren(TabPanelComponent)
    public tabs: QueryList<TabPanelComponent>;

    /**
     * @description Emits when tab is selected
     * @type {EventEmitter<TabPanelComponent>}
     */
    @Output() public onTogglePanel: EventEmitter<TabPanelComponent> = new EventEmitter<TabPanelComponent>();

    ngAfterContentInit() {
        this._setActiveTab();
    }

    private _setActiveTab(): void {
        this.tabs.filter((tab: TabPanelComponent) => tab.active);
    }

    /**
     * @description Select tab for opening
     * @param {TabPanelComponent} tab
     */
    public togglePanel(tab: TabPanelComponent): void {
        if (tab.active) {
            this.handleClose(tab.id);
        } else {
            this.handleOpen(tab.id);
        }
    }

    /**
     * @description Retrieves NgClasses for tab
     * @param tab
     * @returns {Object}
     */
    public getTabClasses(tab: TabPanelComponent): Object {
        return {
            'ss-tab-panels__navigation-item--active': tab.active,
            'ss-tab-panels__navigation-item--disabled': tab.disabled,
            [`ss-tab-panels__navigation-item--${tab.alignment}`]: true,
        };
    }

    /**
     * @description Closes the tab with the passed id
     * @param {string} id
     */
    public handleClose(id: string): void {
        if (!this.tabs) {
            return;
        }

        const tabIndex = this._getTabIndexById(id);
        const tab = this.tabs.toArray()[tabIndex];

        if (!tab) {
            return;
        }
        if (!tab.active) {
            return;
        }

        tab.active = false;
        this.onTogglePanel.emit(tab);
    }

    /**
     * @description Closes all tabs
     */
    public handleCloseAll(): void {
        this.tabs.forEach((tab: TabPanelComponent) => tab.active ? this.handleClose(tab.id) : null);
    }

    /**
     * @description Opens the tab with the passed id
     * @param {string} id
     */
    public handleOpen(id: string): void {
        if (!this.tabs) {
            return;
        }

        const tabIndex = this._getTabIndexById(id);
        const tab = this.tabs.toArray()[tabIndex];

        if (tab && tab.active) {
            return;
        }

        this.handleCloseAll();
        tab.active = true;
        this.onTogglePanel.emit(tab);
    }

    private _getTabIndexById(id: string): number {
        return this.tabs.toArray().findIndex((tab: TabPanelComponent) => tab.id === id);
    }
}
