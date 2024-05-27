/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ComponentRef,
    Injectable,
    InjectionToken,
    Injector,
    Type,
    ViewContainerRef
} from '@angular/core';
import {
    Observable,
    Subject
} from 'rxjs';

export const DRAWER_DATA = new InjectionToken('Drawer Data');

export interface DrawerRef {
    afterClosed(): Observable<void>;
}

@Injectable({
    providedIn: 'root',
})
export class DrawerService {

    private _onClose = new Subject<void>();
    private _viewContainerRef: ViewContainerRef;

    constructor(private _injector: Injector) {}

    public setViewContainerRef(viewContainerRef: ViewContainerRef): void {
        this._viewContainerRef = viewContainerRef;
    }

    public open<T, D>(component: Type<T>, data?: D): DrawerRef {
        this.close();

        const injector = this._createInjector(this._viewContainerRef, data);
        this._inject(injector, component, this._viewContainerRef);

        return {
            afterClosed: () => this._onClose,
        };
    }

    public close(): void {
        if (this._viewContainerRef) {
            this._viewContainerRef.remove();
            this._onClose.next();
            this._onClose.complete();
            this._onClose = new Subject<void>();
        }
    }

    private _createInjector(viewContainerRef: ViewContainerRef, data: any): Injector {
        const parent = viewContainerRef.injector || this._injector;
        const providers = [];

        if (data) {
            providers.push({
                provide: DRAWER_DATA,
                useValue: data,
            });
        }

        return Injector.create({
            parent,
            providers,
        });
    }

    private _inject<T>(injector: Injector, component: Type<T>, viewContainerRef: ViewContainerRef): ComponentRef<T> {
        const componentRef = viewContainerRef.createComponent(component, {injector});
        viewContainerRef.insert(componentRef.hostView);
        return componentRef;
    }
}
