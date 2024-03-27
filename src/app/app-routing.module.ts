import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WebSpeechComponent } from './web-speech/web-speech.component';
import { QuestionsComponent } from './questions/questions.component';


const routes: Routes = [
  {
    path: '',
    component: WebSpeechComponent,
    pathMatch: 'full'
  },
  {
    path: 'question',
    component: QuestionsComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
