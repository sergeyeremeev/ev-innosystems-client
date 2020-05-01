import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';

import { BillingButtonAction } from '../../../types/Billing';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { TableAction } from './table-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../utils/Utils';

export class TableSyncBillingUserInvoicesAction implements TableAction {
  private action: TableActionDef = {
    id: BillingButtonAction.SYNCHRONIZE_USER_INVOICES,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.invoice.synchronize_invoices',
    tooltip: 'general.synchronize',
    action: this.synchronizeInvoices,
  };

  private synchronizeInvoices(dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.billing.invoice.synchronize_invoices_dialog_title'),
      translateService.instant('settings.billing.invoice.synchronize_invoices_dialog_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        messageService.showInfoMessage('settings.billing.invoice.synchronize_invoices_started');
        centralServerService.synchronizeUserInvoices().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            if (synchronizeResponse.inSuccess) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success',
                {number: synchronizeResponse.inSuccess}));
            } else if (!synchronizeResponse.inError) {
              messageService.showSuccessMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_success_all'));
            }
            if (synchronizeResponse.inError) {
              messageService.showWarningMessage(translateService.instant('settings.billing.invoice.synchronize_invoices_failure',
                {number: synchronizeResponse.inError}));
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.billing.invoice.synchronize_invoices_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.billing.invoice.synchronize_invoices_error');
        });
      }
    });
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}