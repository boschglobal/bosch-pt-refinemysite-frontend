/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DayCardFocusSelectHelper} from './day-card-focus-helper.service';

describe('Day Card Focus Helper', () => {

    let dayCardFocusHelper: DayCardFocusSelectHelper;
    const mockTaskIdA = 'foo_a';

    beforeEach(() => {
        dayCardFocusHelper = new DayCardFocusSelectHelper();
    });

    it('should emit onDayCardFocused when a day card is focused', () => {
        let count = 0;

        dayCardFocusHelper.onDayCardFocused().subscribe(() => count++);
        dayCardFocusHelper.newCardFocus(mockTaskIdA);

        expect(count).toBe(1);
    });

    it('should emit null onDayCardFocused when closeFocusedDayCard and we have previously focused a dayCard', () => {
        dayCardFocusHelper.newCardFocus(mockTaskIdA);

        let count = 0;
        dayCardFocusHelper.onDayCardFocused().subscribe((emited) => {
            if (emited === null) {
                count++;
            }
        });
        dayCardFocusHelper.closeFocusedDayCard();

        expect(count).toBe(1);
    });

    it('should not emit onDayCardFocused when closeFocusedDayCard and we have no daycardFocused', () => {
        let count = 0;
        dayCardFocusHelper.onDayCardFocused().subscribe(() => {
            count++;
        });
        dayCardFocusHelper.closeFocusedDayCard();

        expect(count).toBe(0);
    });

    it('should set focusedDayCardId when a day card is focused and unset it when it is close', () => {
        dayCardFocusHelper.newCardFocus(mockTaskIdA);
        expect(dayCardFocusHelper.getSelectedDayCardId()).toBe(mockTaskIdA);

        dayCardFocusHelper.closeFocusedDayCard();
        expect(dayCardFocusHelper.getSelectedDayCardId()).toBe(null);
    });
});
