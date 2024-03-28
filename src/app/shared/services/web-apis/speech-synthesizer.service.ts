import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeechSynthesizerService {
  speechSynthesizer!: SpeechSynthesisUtterance;

  essayBehaviour = new BehaviorSubject('')

  constructor() {
    this.initSynthesis();
  }

  initSynthesis(): void {
    this.speechSynthesizer = new SpeechSynthesisUtterance();
    this.speechSynthesizer.volume = 1;
    this.speechSynthesizer.rate = 1;
    this.speechSynthesizer.pitch = 0.2;
  }

  speak(message: string, language: string): void {
    this.speechSynthesizer.lang = language;
    this.speechSynthesizer.text = message;
    speechSynthesis.speak(this.speechSynthesizer);
  }
  initSynthesisonSelect(speed: any): void {
    const data = ['','slow', 'medium', 'fast'];
    this.speechSynthesizer = new SpeechSynthesisUtterance("This example speaks a string with the speaking rate set to " + data[speed]);
    this.speechSynthesizer.volume = 10;
    this.speechSynthesizer.rate = speed;
    this.speechSynthesizer.pitch = 0.2;
    speechSynthesis.speak(this.speechSynthesizer);
  }

  speakEssayPromptEn(): void {
    this.speechSynthesizer.lang = 'en-US';
    this.speechSynthesizer.text = 'The Anwer You have Provided is as follows';
    speechSynthesis.speak(this.speechSynthesizer);
  }
  speakQuestionNext(): void {
    this.speechSynthesizer.lang = 'en-US';
    this.speechSynthesizer.text = 'Say Confirm to Proceed';
    speechSynthesis.speak(this.speechSynthesizer);
  }

  checkPromptedText(text: string) {
    const prompt = text.toLowerCase();
    let value = false;
    switch (prompt) {
      case 'slow':
        this.initSynthesisonSelect(1)
        //this.speakQuestionNext()
        break;
      case 'medium':
        this.initSynthesisonSelect(2)
        //this.speakQuestionNext()
        break;
      case 'fast':
        this.initSynthesisonSelect(3)
        //this.speakQuestionNext()
        break;
      case 'confirm':
        value = true;
        break;

    }
  }
  checkPromptedTextConfirm(text: string) {
    const prompt = text.toLowerCase();
    let value = false;
    switch (prompt) {
      case 'confirm':
        value = true;
        break;
    }
    return value;
  }

  speakEssay(message: string, language: string): void {
    this.speechSynthesizer.lang = language;
    this.speechSynthesizer.text = message;
    speechSynthesis.speak(this.speechSynthesizer);
    this.essayBehaviour = new BehaviorSubject('')
    this.speechSynthesizer.onend = (event) => {
      console.log(
        `Utterance has finished being spoken after ${event.elapsedTime} seconds.`,
      );
    };
   
  }
}
