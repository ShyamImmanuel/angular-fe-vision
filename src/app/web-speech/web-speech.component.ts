import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { defaultLanguage, languages } from '../shared/model/languages';
import { SpeechError } from '../shared/model/speech-error';
import { SpeechEvent } from '../shared/model/speech-event';
import { SpeechRecognizerService } from '../shared/services/web-apis/speech-recognizer.service';
import { ActionContext } from '../shared/services/actions/action-context';
import { SpeechNotification } from '../shared/model/speech-notification';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';
import { PythonService } from '../shared/services/python-api-cal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'wsa-web-speech',
  templateUrl: './web-speech.component.html',
  styleUrls: ['./web-speech.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebSpeechComponent implements OnInit , AfterViewInit{
  languages: string[] = languages;
  currentLanguage: string = defaultLanguage;
  totalTranscript?: string;

  transcript$?: Observable<string>;
  listening$?: Observable<boolean>;
  errorMessage$?: Observable<string>;
  defaultError$ = new Subject<string | undefined>();

  constructor(
    private speechRecognizer: SpeechRecognizerService,
    private actionContext: ActionContext,
    private synthServive :PythonService,
    private router:Router,
    private speechSynthesizer: SpeechSynthesizerService
  ) {}

  ngOnInit(): void {
    const webSpeechReady = this.speechRecognizer.initialize(this.currentLanguage);
    if (webSpeechReady) {
      this.initRecognition();
    }else {
      this.errorMessage$ = of('Your Browser is not supported. Please try Google Chrome.');
    }
   // this.start();
  }

  ngAfterViewInit(){
    this.callInstruction();
  }
  start(): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
      return;
    }

    this.defaultError$.next(undefined);
    this.speechRecognizer.start();
  }

  stop(): void {
    this.speechRecognizer.stop();
  }

  selectLanguage(language: string): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
    }
    this.currentLanguage = language;
    this.speechRecognizer.setLanguage(this.currentLanguage);
  }

  private initRecognition(): void {
    this.transcript$ = this.speechRecognizer.onResult().pipe(
      tap((notification) => {
        this.processNotification(notification);
      }),
      map((notification) => notification.content || '')
    );

    this.listening$ = merge(
      this.speechRecognizer.onStart(),
      this.speechRecognizer.onEnd()
    ).pipe(map((notification) => notification.event === SpeechEvent.Start));

    this.errorMessage$ = merge(
      this.speechRecognizer.onError(),
      this.defaultError$
    ).pipe(
      map((data) => {
        if (data === undefined) {
          return '';
        }
        if (typeof data === 'string') {
          return data;
        }
        let message;
        switch (data.error) {
          case SpeechError.NotAllowed:
            message = `Cannot run the demo.
            Your browser is not authorized to access your microphone.
            Verify that your browser has access to your microphone and try again.`;
            break;
          case SpeechError.NoSpeech:
            message = `No speech has been detected. Please try again.`;
            break;
          case SpeechError.AudioCapture:
            message = `Microphone is not available. Plese verify the connection of your microphone and try again.`;
            break;
          default:
            message = '';
            break;
        }
        return message;
      })
    );
  }

  private processNotification(notification: SpeechNotification<string>): void {
    if (notification.event === SpeechEvent.FinalContent) {
      const message = notification.content?.trim() || '';
      this.actionContext.processMessage(message, this.currentLanguage);
      this.actionContext.runAction(message, this.currentLanguage);
      this.totalTranscript = this.totalTranscript
        ? `${this.totalTranscript}\n${message}`
        : notification.content;
    }
  }

  callInstruction(){
    this.synthServive.callInstruction().subscribe(res=>{
      if(res){
        // this.start();
        this.callMessage()
      }
    })
    
  }
  callMessage(){
    this.synthServive.start();
    this.speechSynthesizer.checkPromptedText(this.synthServive.text)
    setTimeout(() => {
    this.synthServive.stop();
    this.callMessageConfirm();
    }, 3000);    
  }
  callMessageConfirm(){
    this.synthServive.start();
    setTimeout(() => {
    this.synthServive.stop();
    const value = this.speechSynthesizer.checkPromptedTextConfirm(this.synthServive.text)
    if(value){
     this.route      
    }else{
      this.speechSynthesizer.checkPromptedText(this.synthServive.text)
      this.callMessage();
    }
    }, 3000);    
  } 
  
  route(){
    this.router.navigate(['/question']);
  }
}
