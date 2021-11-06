/*
 * Copyright (C) 2021 Axel Müller <axel.mueller@avanux.de>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Logger} from '../../log/logger';
import {TranslateService} from '@ngx-translate/core';
import {ErrorMessageHandler} from '../../shared/error-message-handler';
import {FormHandler} from '../../shared/form-handler';
import {ErrorMessages} from '../../shared/error-messages';
import {MasterElectricityMeter} from './master-electricity-meter';
import {ListItem} from '../../shared/list-item';

@Component({
  selector: 'app-meter-master',
  templateUrl: './meter-master.component.html',
  styleUrls: ['./meter-master.component.scss']
})
export class MeterMasterComponent implements OnChanges, OnInit {
  @Input()
  masterMeter: MasterElectricityMeter;
  @Input()
  form: FormGroup;
  formHandler: FormHandler;
  errors: { [key: string]: string } = {};
  errorMessages: ErrorMessages;
  errorMessageHandler: ErrorMessageHandler;
  switchOnOptions: ListItem[] = [];
  private readonly switchOnTrue = 'MeterMasterComponent.switchOn.true';
  private readonly switchOnFalse = 'MeterMasterComponent.switchOn.false';

  constructor(private logger: Logger,
              private translate: TranslateService
  ) {
    this.errorMessageHandler = new ErrorMessageHandler(logger);
    this.formHandler = new FormHandler();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.masterMeter) {
      if (changes.masterMeter.currentValue) {
        this.masterMeter = changes.masterMeter.currentValue;
      } else {
        this.masterMeter = new MasterElectricityMeter();
      }
      this.expandParentForm();
    }
    if (changes.form) {
      this.expandParentForm();
    }
  }

  ngOnInit() {
    const switchOnKeys = [this.switchOnTrue, this.switchOnFalse];
    this.translate.get(switchOnKeys).subscribe(translatedStrings => {
      this.switchOnOptions.push({value: null, viewValue: ''} as ListItem);
      Object.keys(translatedStrings).forEach(key => {
        this.switchOnOptions.push({value: key, viewValue: translatedStrings[key]} as ListItem);
      });
    });
  }

  toSwitchOnKey(switchOn: boolean | null): string | undefined {
    if (switchOn !== null) {
      return switchOn ? this.switchOnTrue : this.switchOnFalse;
    }
    return undefined;
  }

  fromSwitchOnKey(switchOnKey: string): boolean | null {
    if (switchOnKey === this.switchOnTrue) {
      return true;
    }
    if (switchOnKey === this.switchOnFalse) {
      return false;
    }
    return null;
  }

  expandParentForm() {
    this.formHandler.addFormControl(this.form, 'masterSwitchOn', this.toSwitchOnKey(this.masterMeter?.masterSwitchOn));
    this.formHandler.addFormControl(this.form, 'slaveSwitchOn', this.toSwitchOnKey(this.masterMeter?.slaveSwitchOn));
  }

  updateModelFromForm(): MasterElectricityMeter {
    const masterSwitchOn = this.fromSwitchOnKey(this.form.controls.masterSwitchOn.value);
    const slaveSwitchOn = this.fromSwitchOnKey(this.form.controls.slaveSwitchOn.value);

    this.masterMeter.masterSwitchOn = masterSwitchOn;
    this.masterMeter.slaveSwitchOn = slaveSwitchOn;
    return this.masterMeter;
  }
}
