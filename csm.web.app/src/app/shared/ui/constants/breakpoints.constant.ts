/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export enum BreakpointsEnum {
    xs = 0,
    sm = 576,
    md = 768,
    lg = 992,
    xl = 1200,
}

export const BREAKPOINTS_RANGE: {[key: string]: BreakpointRange} = {
    xs: {min: BreakpointsEnum.xs, max: BreakpointsEnum.sm - 1},
    sm: {min: BreakpointsEnum.sm, max: BreakpointsEnum.md - 1},
    md: {min: BreakpointsEnum.md, max: BreakpointsEnum.lg - 1},
    lg: {min: BreakpointsEnum.lg, max: BreakpointsEnum.xl - 1},
    xl: {min: BreakpointsEnum.xl, max: Infinity},
};

export class BreakpointRange {
    min: number;
    max: number;
}
