/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export enum BreakpointsEnum {
    Xs = 0,
    Sm = 576,
    Md = 768,
    Lg = 992,
    Xl = 1200,
}

export const BREAKPOINTS_RANGE: {[key: string]: BreakpointRange} = {
    xs: {min: BreakpointsEnum.Xs, max: BreakpointsEnum.Sm - 1},
    sm: {min: BreakpointsEnum.Sm, max: BreakpointsEnum.Md - 1},
    md: {min: BreakpointsEnum.Md, max: BreakpointsEnum.Lg - 1},
    lg: {min: BreakpointsEnum.Lg, max: BreakpointsEnum.Xl - 1},
    xl: {min: BreakpointsEnum.Xl, max: Infinity},
};

export class BreakpointRange {
    min: number;
    max: number;
}
