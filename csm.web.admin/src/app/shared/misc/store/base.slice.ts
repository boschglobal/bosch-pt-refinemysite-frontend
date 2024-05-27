/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

/**
 * @description Base Class to be used for stores that hold a resource (caches all loaded resources and stores information about the)
 * currently selected resource as well as the current list of resources seen on a UI somewhere)
 *
 * I: Current Item
 * L: List Class
 * R: Resource Class (for a single resource)
 *
 */
export interface BaseSlice<I, L, R> {
    currentItem: I;
    list: L;
    items: R[];
}
