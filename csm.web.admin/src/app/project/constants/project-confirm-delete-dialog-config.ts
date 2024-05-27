/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ConfirmationDialogDataConfig} from '../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';

export const PROJECT_DELETE_CONFIRM_DIALOG_CONFIG: ConfirmationDialogDataConfig = {
    titleLabel: 'ProjectDetailsComponent_ConfirmationDialog_DeleteProject_Title',
    message: 'ProjectDetailsComponent_ConfirmationDialog_DeleteProject_Message',
    confirmationButtonLabel: 'Generic_Delete',
    confirmButtonColor: 'warn',
    cancelButtonLabel: 'Generic_Cancel',
    confirmationInputLabel: 'ProjectResource_Name',
};
