/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ComponentFactory,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    Injector,
    NgModuleRef,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewRef
} from '@angular/core';

export class ViewContainerRefStub extends ViewContainerRef {
    constructor(private _injector?: Injector,
                private _componentRef?: { instance: any; hostView: any }) {
        super();
    }

    get element(): ElementRef<any> {
        return undefined;
    }

    get injector(): Injector {
        return this._injector;
    }

    get length(): number {
        return 0;
    }

    get parentInjector(): Injector {
        return undefined;
    }

    clear(): void {
    }

    createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, options?: number | {
        index?: number;
        injector?: Injector;
    }): EmbeddedViewRef<C> {
        return undefined;
    }

    detach(index?: number): ViewRef | null {
        return undefined;
    }

    get(index: number): ViewRef | null {
        return undefined;
    }

    indexOf(viewRef: ViewRef): number {
        return 0;
    }

    insert(viewRef: ViewRef, index?: number): ViewRef {
        return undefined;
    }

    move(viewRef: ViewRef, currentIndex: number): ViewRef {
        return undefined;
    }

    remove(index?: number): void {
    }

    createComponent<C>(componentType: Type<C>, options?: {
        index?: number; injector?: Injector; ngModuleRef?: NgModuleRef<unknown>; projectableNodes?: Node[][]
    }): ComponentRef<C>;
    createComponent<C>(componentFactory: ComponentFactory<C>,
                       index?: number, injector?: Injector, projectableNodes?: any[][], ngModuleRef?: NgModuleRef<any>): ComponentRef<C>;
    createComponent(componentType, options?: {
        index?: number; injector?: Injector; ngModuleRef?: NgModuleRef<unknown>; projectableNodes?: Node[][];
    } | number, injector?: Injector, projectableNodes?: any[][], ngModuleRef?: NgModuleRef<any>): any {
        return this._componentRef;
    }

}
