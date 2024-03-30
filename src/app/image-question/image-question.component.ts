import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PythonService } from '../shared/services/python-api-cal.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';

@Component({
  selector: 'wsa-image-question',
  templateUrl: './image-question.component.html',
  styleUrls: ['./image-question.component.css']
})
export class ImageQuestionComponent implements OnInit {

  option: any;
  speechSynthesizerEssay!: SpeechSynthesisUtterance;
  subscription: Subscription = new Subscription;
  questions = "Which Country's PC Shipments records are represented in the bar chart"; 
  //  Option One : 'INDIA',Option two :'RUSSIA',Option three'CHINA', Option Four:  'USA'";
  options = ['INDIA','RUSSIA','CHINA','USA'];

  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive: PythonService, private speechSynthesizer: SpeechSynthesizerService,
    private router: Router,

  ) { }
  speakLang = true;

  ngOnInit(): void {
    this.speakLang = true;
  }

  checkEnd(){
    this.speechSynthesizer.speechSynthesizer.addEventListener("end", (event) => {
      console.log(event);
    });
  }
  ngAfterViewInit() {
    this.initSynthesis();
    this.callInstruction();
    this.synthServive.init()
  }

  callInstruction() {
    this.synthServive.callImage().subscribe(res => {
      if (res) {
        this.callOptionsQuestions()
        //this.callMessage();
      }
    })

  }

 async callOptionsQuestions(){
     await this.speak(this.questions,'en-US');
      for(let i=0; i<this.options?.length; i++){
        const text = "Option  " + this.options[i];
        await this.speak(text,'en-US');
    }
    this.callMessage();
  }

  async  speak(message: string ,language:string) {
    return new Promise((resolve, reject) => {
      const utterThis = new SpeechSynthesisUtterance();
      utterThis.lang = language;
      utterThis.text = message;
      speechSynthesis.speak(utterThis);
      utterThis.onend = resolve;
    });
  }
  callMessage() {
    this.synthServive.start();
    setTimeout(() => {
      this.synthServive.stop();
      this.option = this.synthServive.text.trim();
      this.speechSynthesizer.speakEssayPromptEn();
      this.speakEssay(this.option.toString(), 'en-US');
      // this.speechSynthesizer.speakQuestionNext();
    }, 10000);
  }


  speakEssay(message: string, language: string): void {
    this.speechSynthesizerEssay.lang = language;
    this.speechSynthesizerEssay.text = message;
    speechSynthesis.speak(this.speechSynthesizerEssay);
    this.speechSynthesizerEssay.onend = (event) => {
      if (!this.speakLang) {
        this.callNext()
      }
      if (this.speakLang) {
        this.callForConfirm()
      }
    };

  }

  callForConfirm() {
    this.speakLang = false;
    this.speechSynthesizerEssay.lang = 'en-US';
    this.speechSynthesizerEssay.text = 'Say Confirm to proceed to next Question';
    speechSynthesis.speak(this.speechSynthesizerEssay);
  }



  callNext() {
    this.synthServive.start();
    setTimeout(() => {
      this.subscription = this.synthServive.textBehaviour.subscribe(res => {
        if (res) {
          console.log('web', res)
          const text = res.toLowerCase();
          this.checkPromptedText(text)
        }
      })
    }, 5000);
  }

  checkPromptedText(text: string) {
    const prompt = text.toLowerCase();
    let value = false;
    switch (prompt) {
      case 'confirm':
        this.synthServive.stop();
        this.routeToNext()
        break;
      case 'confirm.':
        this.synthServive.stop();
        this.routeToNext()
        break;
      case 'previous.':
        this.synthServive.stop();
        this.routeToPrevious()
        break;
      case 'back.':
        this.synthServive.stop();
        this.routeToPrevious()
        break;

    }
  }
  routeToPrevious() {
    this.router.navigate(['/question']);
  }
  routeToNext() {
    console.log('NEXT')
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

}
