/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EllipsisPipe} from '../../../../app/shared/ui/pipes/ellipsis.pipe';

describe('Ellipsis Pipe', () => {
    const content = 'Lorem Ipsum zxczxcLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sem dui, faucibus a varius at, bibendum ac justo. Duis imperdiet augue in auctor pulvinar. Sed ultricies porttitor luctus. Nam lacus massa, pulvinar in ullamcorper id, bibendum eget velit. Sed aliquet laoreet felis, varius auctor ante varius nec. Integer blandit eleifend augue, eu eleifend lectus. Praesent facilisis est a elit volutpat vehicula. Vestibulum eu vehicula quam. Phasellus nec scelerisque risus, vel tempus lorem. Phasellus hendrerit, ipsum at iaculis placerat, justo felis accumsan dolor, eu ultricies elit lorem sed mi. Praesent rutrum lacus convallis augue ullamcorper, in gravida augue molestie. Nam venenatis orci arcu, non condimentum diam tempus sed. In hac habitasse platea dictumst. Nullam ornare interdum dui a lobortis. Etiam ut mauris nec metus dapibus pellentesque. Quisque venenatis non nunc in ullamcorper.';
    const contentMax100 = 'Lorem Ipsum zxczxcLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sem dui, faucibus ...';
    let pipe: EllipsisPipe;
    beforeEach(() => {
        pipe = new EllipsisPipe();
    });

    it('should transform a long setence in 2 lines with only +/- 100 chars and ellipsis on end', () => {
        const maxChars = 100;
        expect(pipe.transform(content, maxChars)).toEqual(contentMax100);
    });

    it('should not transform a long sentence if no size was given', () => {
        expect(pipe.transform(content)).toEqual(content);
    });

    it('should not transform a long sentence if null size was given', () => {
        expect(pipe.transform(content, null)).toEqual(content);
    });

    it('should not transform a undefined value', () => {
        const contentUndefined: string = undefined;
        expect(pipe.transform(contentUndefined, null)).toEqual(contentUndefined);
    });
});
