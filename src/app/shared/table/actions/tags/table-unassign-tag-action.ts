import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { ButtonColor, ButtonType, TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { UserButtonAction } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableUnassignTagActionDef extends TableActionDef {
  action: (tag: Tag, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableUnassignTagAction implements TableAction {
  public getActionDef(): TableUnassignTagActionDef {
    return {
      id: TagButtonAction.UNASSIGN_TAG,
      action: this.unassignTag,
      type: 'button',
      icon: 'link_off',
      color: ButtonColor.PRIMARY,
      name: 'general.unassign',
      tooltip: 'general.tooltips.unassign',
    };
  }

  private unassignTag(tag: Tag, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('tags.unassign_title'),
      translateService.instant('tags.unassign_confirm', { visualID: tag.visualID }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        centralServerService.unassignTag(tag.visualID).subscribe((response) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage(
              translateService.instant('tags.unassign_success', { visualID: tag.visualID }));
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response), messageService, 'tags.unassign_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'tags.unassign_error');
        });
      }
    }
    );
  }
}
