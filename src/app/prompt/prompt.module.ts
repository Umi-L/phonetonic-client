import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromptPageRoutingModule } from './prompt-routing.module';

import { PromptPage } from './prompt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PromptPageRoutingModule
  ],
  declarations: [PromptPage]
})
export class PromptPageModule {}
