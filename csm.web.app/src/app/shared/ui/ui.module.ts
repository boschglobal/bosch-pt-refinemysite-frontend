/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {TranslationModule} from '../translation/translation.module';
import {ButtonComponent} from './button/button.component';
import {CalendarComponent} from './calendar/calendar/calendar.component';
import {CalendarHeaderComponent} from './calendar/calendar-header/calendar-header.component';
import {MilestoneSlotsComponent} from './calendar/milestone-slots/milestone-slots.component';
import {CardCompanyComponent} from './cards/card-company-component/card-company.component';
import {CardContactComponent} from './cards/card-contact-component/card-contact.component';
import {CardInformationComponent} from './cards/card-information-component/card-information.component';
import {CardUserComponent} from './cards/card-user-component/card-user.component';
import {DonutChartComponent} from './charts/donut-chart-component/donut-chart.component';
import {ChipComponent} from './chips/chip/chip.component';
import {ChipListComponent} from './chips/chip-list/chip-list.component';
import {CollapsibleButtonListComponent} from './collapsible-button-list/collapsible-button-list.component';
import {CollapsibleListComponent} from './collapsible-list/collapsible-list.component';
import {CollapsibleSelectComponent} from './collapsible-select/collapsible-select.component';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {CopyrightComponent} from './copyright/copyright.component';
import {DatePipe} from './dates/date.pipe';
import {DescriptionLabelComponent} from './description-label/description-label.component';
import {BackgroundImageDirective} from './directives/background-image.directive';
import {DownloadFileDirective} from './directives/download-file.directive';
import {IfFeatureActiveDirective} from './directives/if-feature-active/if-feature-active.directive';
import {IfMediaQueryDirective} from './directives/if-media-query.directive';
import {ImageDirective} from './directives/image.directive';
import {MessageDateDirective} from './directives/message-date.directive';
import {DropdownMenuComponent} from './dropdowns/dropdown-menu/dropdown-menu.component';
import {DropdownMultipleSelectComponent} from './dropdowns/dropdown-multiple-select/dropdown-multiple-select.component';
import {DropdownSelectComponent} from './dropdowns/dropdown-select/dropdown-select.component';
import {FlyoutDirective} from './flyout/directive/flyout.directive';
import {FlyoutTooltipComponent} from './flyout-tooltip/flyout-tooltip.component';
import {CheckboxButtonComponent} from './forms/checkbox-button/checkbox-button.component';
import {DatepickerCalendarComponent} from './forms/datepicker-calendar/datepicker-calendar.component';
import {InputAutocompleteComponent} from './forms/input-autocomplete/input-autocomplete.component';
import {InputCheckboxNestedComponent} from './forms/input-checkbox-nested/input-checkbox-nested.component';
import {InputColorpickerComponent} from './forms/input-colorpicker/input-colorpicker.component';
import {InputDatepickerComponent} from './forms/input-datepicker/input-datepicker.component';
import {InputFilesComponent} from './forms/input-files/input-files.component';
import {InputMaskDirective} from './forms/input-mask/input-mask.directive';
import {InputMultipleSelectComponent} from './forms/input-multiple-select/input-multiple-select.component';
import {InputNumberComponent} from './forms/input-number/input-number.component';
import {InputPictureComponent} from './forms/input-picture/input-picture.component';
import {InputSelectDropdownComponent} from './forms/input-select-dropdown/input-select-dropdown.component';
import {InputTextComponent} from './forms/input-text/input-text.component';
import {InputTextareaComponent} from './forms/input-textarea/input-textarea.component';
import {InputTextareaUserComponent} from './forms/input-textarea-user/input-textarea-user.component';
import {RadioButtonComponent} from './forms/radio-button/radio-button.component';
import {SwitchButtonComponent} from './forms/switch-button/switch-button.component';
import {GroupItemListComponent} from './group-item-list/group-item-list.component';
import {GroupListSelectionComponent} from './group-list-selection/group-list-selection.component';
import {IconModule} from './icons/icon.module';
import {ButtonLinkComponent} from './links/button-link/button-link.component';
import {MailLinkComponent} from './links/mail-link/mail-link-component/mail-link.component';
import {PhoneLinkComponent} from './links/phone-link/phone-link-component/phone-link.component';
import {LoaderComponent} from './loader/loader.component';
import {MarkerModule} from './marker/marker.module';
import {MenuItemComponent} from './menus/menu-item/menu-item.component';
import {MenuListComponent} from './menus/menu-list/menu-list.component';
import {MessageItemComponent} from './messages/message-item-component/message-item.component';
import {ReplyActionsComponent} from './messages/reply-actions-component/reply-actions.component';
import {ModalModule} from './modal/modal.module';
import {MultipleSelectionToolbarConfirmationComponent} from './multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';
import {NewsArticleComponent} from './news-article/news-article.component';
import {PaginatorComponent} from './paginator/paginator-component/paginator.component';
import {PaginatorEntriesComponent} from './paginator/paginator-entries/paginator-entries.component';
import {PaginatorItemsComponent} from './paginator/paginator-items/paginator-items.component';
import {PaginatorPagesComponent} from './paginator/paginator-pages/paginator-pages.component';
import {EllipsisPipe} from './pipes/ellipsis.pipe';
import {TruncatedCounterPipe} from './pipes/truncated-counter.pipe';
import {ProgressBarComponent} from './progress-bar/progress-bar.component';
import {ScopeDropdownComponent} from './scope-dropdown/scope-dropdown.component';
import {SelectListComponent} from './select-list/select-list.component';
import {ShowMoreComponent} from './show-more/show-more.component';
import {SortableListComponent} from './sortable-list/sortable-list.component';
import {StatusTransitionComponent} from './status-transition/status-transition.component';
import {TabPanelComponent} from './tab-panels/tab-panel/tab-panel.component';
import {TabPanelsComponent} from './tab-panels/tab-panels/tab-panels.component';
import {TableComponent} from './table/table.component';
import {TableCellComponent} from './table/table-cell.component';
import {TagComponent} from './tags/tag/tag.component';
import {TagListComponent} from './tags/tag-list/tag-list.component';
import {TextImageArticleComponent} from './text-image-article/text-image-article.component';
import {TextLinkComponent} from './text-link/text-link.component';
import {ThumbnailGalleryComponent} from './thumbnail-gallery-component/thumbnail-gallery.component';
import {TimeScopeLabelComponent} from './time-scope/time-scope-label/time-scope-label.component';
import {TinyLoaderComponent} from './tiny-loader/tiny-loader.component';
import {TrafficLightComponent} from './traffic-light/traffic-light.component';
import {TrafficLightWithLabelComponent} from './traffic-light/traffic-light-with-label.component';
import {WizardStepComponent} from './wizard-steps/wizard-step/wizard-step.component';
import {WizardStepsComponent} from './wizard-steps/wizard-steps.component';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        IconModule,
        ModalModule,
        MarkerModule,
        ReactiveFormsModule,
        RouterModule,
        TranslationModule,
    ],
    exports: [
        BackgroundImageDirective,
        ButtonComponent,
        ButtonLinkComponent,
        CalendarComponent,
        CalendarHeaderComponent,
        CardCompanyComponent,
        CardContactComponent,
        CardInformationComponent,
        CardUserComponent,
        CheckboxButtonComponent,
        ChipComponent,
        ChipListComponent,
        CollapsibleButtonListComponent,
        CollapsibleListComponent,
        CollapsibleSelectComponent,
        ConfirmationDialogComponent,
        CopyrightComponent,
        DatePipe,
        DescriptionLabelComponent,
        DonutChartComponent,
        DownloadFileDirective,
        DropdownMenuComponent,
        DropdownMultipleSelectComponent,
        DropdownSelectComponent,
        EllipsisPipe,
        FlyoutDirective,
        FlyoutTooltipComponent,
        GroupListSelectionComponent,
        IfFeatureActiveDirective,
        IfMediaQueryDirective,
        ImageDirective,
        InputAutocompleteComponent,
        InputCheckboxNestedComponent,
        InputColorpickerComponent,
        InputDatepickerComponent,
        InputFilesComponent,
        InputMultipleSelectComponent,
        InputNumberComponent,
        InputPictureComponent,
        InputSelectDropdownComponent,
        InputTextComponent,
        InputTextareaComponent,
        InputTextareaUserComponent,
        LoaderComponent,
        ProgressBarComponent,
        MailLinkComponent,
        MarkerModule,
        MenuListComponent,
        MessageDateDirective,
        MessageItemComponent,
        MultipleSelectionToolbarConfirmationComponent,
        NewsArticleComponent,
        PaginatorComponent,
        PhoneLinkComponent,
        RadioButtonComponent,
        ReplyActionsComponent,
        ScopeDropdownComponent,
        SelectListComponent,
        ShowMoreComponent,
        SortableListComponent,
        SwitchButtonComponent,
        TabPanelComponent,
        TabPanelsComponent,
        TableCellComponent,
        TableComponent,
        TagComponent,
        TagListComponent,
        TextImageArticleComponent,
        TextLinkComponent,
        ThumbnailGalleryComponent,
        TimeScopeLabelComponent,
        TinyLoaderComponent,
        TrafficLightComponent,
        TrafficLightWithLabelComponent,
        TruncatedCounterPipe,
        WizardStepComponent,
        WizardStepsComponent,
        StatusTransitionComponent,
    ],
    declarations: [
        BackgroundImageDirective,
        ButtonComponent,
        ButtonLinkComponent,
        CalendarComponent,
        CalendarHeaderComponent,
        CardCompanyComponent,
        CardContactComponent,
        CardInformationComponent,
        CardUserComponent,
        CheckboxButtonComponent,
        ChipComponent,
        ChipListComponent,
        CollapsibleButtonListComponent,
        CollapsibleListComponent,
        CollapsibleSelectComponent,
        ConfirmationDialogComponent,
        CopyrightComponent,
        DatePipe,
        DatepickerCalendarComponent,
        DescriptionLabelComponent,
        DonutChartComponent,
        DownloadFileDirective,
        DropdownMenuComponent,
        DropdownMultipleSelectComponent,
        DropdownSelectComponent,
        EllipsisPipe,
        FlyoutDirective,
        FlyoutTooltipComponent,
        GroupItemListComponent,
        GroupListSelectionComponent,
        IfFeatureActiveDirective,
        IfMediaQueryDirective,
        ImageDirective,
        InputAutocompleteComponent,
        InputCheckboxNestedComponent,
        InputColorpickerComponent,
        InputDatepickerComponent,
        InputFilesComponent,
        InputMaskDirective,
        InputMultipleSelectComponent,
        InputNumberComponent,
        InputPictureComponent,
        InputSelectDropdownComponent,
        InputTextComponent,
        InputTextareaComponent,
        InputTextareaUserComponent,
        LoaderComponent,
        ProgressBarComponent,
        MailLinkComponent,
        MenuItemComponent,
        MenuListComponent,
        MessageDateDirective,
        MessageItemComponent,
        MilestoneSlotsComponent,
        MultipleSelectionToolbarConfirmationComponent,
        NewsArticleComponent,
        PaginatorComponent,
        PaginatorEntriesComponent,
        PaginatorItemsComponent,
        PaginatorPagesComponent,
        PhoneLinkComponent,
        RadioButtonComponent,
        ReplyActionsComponent,
        ScopeDropdownComponent,
        SelectListComponent,
        ShowMoreComponent,
        SortableListComponent,
        StatusTransitionComponent,
        SwitchButtonComponent,
        TabPanelComponent,
        TabPanelsComponent,
        TableCellComponent,
        TableComponent,
        TagComponent,
        TagListComponent,
        TextImageArticleComponent,
        TextLinkComponent,
        ThumbnailGalleryComponent,
        TimeScopeLabelComponent,
        TinyLoaderComponent,
        TrafficLightComponent,
        TrafficLightWithLabelComponent,
        TruncatedCounterPipe,
        WizardStepComponent,
        WizardStepsComponent,
    ],
})
export class UIModule {
}
