import { ActionStrategy } from './action-strategy';
import { Theme } from '../../model/theme';
import { StyleManager } from '../../style-manager/style-manager';
import { Injectable } from '@angular/core';
import { SpeechSynthesizerService } from '../web-apis/speech-synthesizer.service';

@Injectable({
  providedIn: 'root',
})
export class ChangeThemeStrategy extends ActionStrategy {
  private mapThemes: Map<string, Theme[]> = new Map<string, Theme[]>();
  private styleManager: StyleManager = new StyleManager();

  constructor(private speechSynthesizer: SpeechSynthesizerService) {
    super();
    this.mapStartSignal.set('en-US', 'start');
    this.mapStartSignal.set('es-ES', 'iniciar cambio de tema');

    
    this.mapEndSignal.set('en-US', 'yes');
    this.mapEndSignal.set('es-ES', 'finalizar cambio de tema');

    this.mapInitResponse.set('en-US', 'Please Select your Reding Speed as Slow , Medium , Fast');
    this.mapInitResponse.set('es-ES', 'Por favor, mencione el nombre de tema.');


    this.mapActionDone.set('en-US', 'Changing Theme of the Application to');
    this.mapActionDone.set('es-ES', 'Cambiando el tema de la Aplicación a');

    this.mapThemes.set('en-US', [
      {
        keyword: 'slow',
        href: '',
      },
      {
        keyword: 'medium',
        href: 'indigo-pink.css',
      },
      {
        keyword: 'fast',
        href: 'pink-bluegrey.css',
      },
      {
        keyword: 'purple',
        href: 'purple-green.css',
      },
    ]);
    this.mapThemes.set('es-ES', [
      {
        keyword: 'púrpura',
        href: 'deeppurple-amber.css',
      },
      {
        keyword: 'azul',
        href: 'indigo-pink.css',
      },
      {
        keyword: 'rosa',
        href: 'pink-bluegrey.css',
      },
      {
        keyword: 'verde',
        href: 'purple-green.css',
      },
    ]);
  }

  runAction(input: string, language: string): void {
    const themes = this.mapThemes.get(language) || [];
    const theme = themes.find((th) => {
      return input.toLocaleLowerCase() === th.keyword;
    });

    if (theme) {
      // this.styleManager.removeStyle('theme');
      // this.styleManager.setStyle('theme', `assets/theme/${theme.href}`);
      let speed = 1;
      if(theme.keyword == 'slow'){
        speed =2
      }else{
        speed =3
      }
      this.speechSynthesizer.initSynthesisonSelect(speed);
      this.speechSynthesizer.speak(
        `${this.mapActionDone.get(language)}: ${theme.keyword}`,
        language
      );
    }
  }
}
