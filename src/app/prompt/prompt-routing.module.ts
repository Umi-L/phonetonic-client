import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromptPage } from './prompt.page';

const routes: Routes = [
  {
    path: '',
    component: PromptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromptPageRoutingModule {}
