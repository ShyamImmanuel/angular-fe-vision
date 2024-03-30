import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WebSpeechComponent } from './web-speech/web-speech.component';
import { QuestionsComponent } from './questions/questions.component';
import { ImageQuestionComponent } from './image-question/image-question.component';
import { TamilQuestionComponent } from './tamil-question/tamil-question.component';


const routes: Routes = [
  {
    path: 'home',
    component: WebSpeechComponent,
    pathMatch: 'full'
  },
  {
    path: 'question',
    component: QuestionsComponent,
    pathMatch: 'full'
  },
  {
    path: 'image',
    component: ImageQuestionComponent,
    pathMatch: 'full'
  },
  {
    path: 'essay',
    component: TamilQuestionComponent,
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
