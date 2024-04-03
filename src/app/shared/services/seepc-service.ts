import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
    recognition!: SpeechRecognition;

    constructor() {
      if ('SpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
      } else {
        console.error('Speech recognition not supported in this browser.');
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
      }
    }

  startRecognition(): void {
    this.recognition.start();
  }

  stopRecognition(): void {
    this.recognition.stop();
  }

  setOnResult(callback: (result: string) => void): void {
    this.recognition.onresult = (event:any) => {
      const transcript = event.results[0][0].transcript;
      callback(transcript);
    };
  }
}
