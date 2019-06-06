import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';

import { InformacaoPage } from './informacao.page';

const routes: Routes = [
  {
    path: '',
    component: InformacaoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InformacaoPage],
  providers: [HTTP]
})
export class InformacaoPageModule {}
