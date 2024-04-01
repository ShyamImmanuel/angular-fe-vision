import { Component, OnInit } from '@angular/core';
import { PythonService } from '../shared/services/python-api-cal.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wsa-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  essayValue: any;
  speechSynthesizerEssay!: SpeechSynthesisUtterance;
  subscription: Subscription = new Subscription;




  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive: PythonService, private speechSynthesizer: SpeechSynthesizerService,
    private router: Router,

  ) { }
  speakLang = false;
  repeat = false;
  speakNext = false;
  count = 0;

  ngOnInit(): void {
    this.speakLang = false;
    this.repeat = false;
    this.speakNext = false;
  }

  ngAfterViewInit() {
    this.initSynthesis();
    this.callInstruction();
  }

  callInstruction() {
    this.synthServive.callEssay().subscribe(res => {
      if (res) {
        this.synthServive.init();
        // this.speechSynthesizerEssay.lang = 'en-US';
        // this.speechSynthesizerEssay.text = 'Please Provide your answer';
        // speechSynthesis.speak(this.speechSynthesizerEssay);
        this.callMessage();
      }
    })

  }
  callMessage() {
    this.repeat = false;
    this.speakLang = false;
    this.speakNext = false;    
    this.synthServive.start();
    setTimeout(() => {
      this.synthServive.stop();
      this.essayValue = this.synthServive.text.trim();
      //this.speechSynthesizer.speakEssayPromptEn();
      this.speakLang = true;
      this.speakEssay(this.essayValue.toString(), 'en-US');
    }, 10000);
  }
  callMessageConfirm() {
    // this.speechSynthesizer.essayBehaviour.subscribe(res=>{
    //   if(res){
    //     console.log('web',res)
    //     setTimeout(() => {
    //         this.callMessageConfirm();

    //     }, 5000);  
    //   }
    // })

  }

  speakEssay(message: string, language: string): void {
    this.synthServive.stop();
    this.speechSynthesizerEssay.lang = language;
    this.speechSynthesizerEssay.text = message;
    speechSynthesis.speak(this.speechSynthesizerEssay);
    this.speechSynthesizerEssay.onend = (event) => {
      if (this.speakLang) {
        this.callForTamilText();
      }
      if (this.speakNext) {
        this.callNext()
      }
      if(this.repeat){
        setTimeout(() => {
          this.synthServive.text ='';
          this.callMessage();
        }, 3000);  
      }
      
    };

  }

  callForTamilText() {
    // const data = this.essayValue.replace(/ /g, '');
    // console.log(data)
    // this.speakLang = true;
    // this.synthServive.callTamilText(this.essayValue).subscribe((res) => {
    //   if (res) {
    //     console.log(res)
        this.speakLang = false;
        this.repeat = false;
        this.speakNext = true;
        this.speechSynthesizerEssay.lang = 'en-US';
        this.speechSynthesizerEssay.text = 'Say Confirm to proceed or Edit to Change your answer';
        this.synthServive.stop();
        speechSynthesis.speak(this.speechSynthesizerEssay);
        
    //   }
    // })
  }

  callNext() {
    this.synthServive.start();
    this.speakLang = false;
    this.repeat = false;
    this.speakNext = false;
    this.count = 0;
    setTimeout(() => {
      this.subscription = this.synthServive.textBehaviour.subscribe(res => {
        if (res) {
          console.log('web', res)
          const text = res.toLowerCase();
          if(text === 'edit.' || text === 'edit'){
            this.count = 1;
          }
          this.checkPromptedText(text)
        }
      })
    }, 3000);
  }

  checkPromptedText(text: string) {
    const prompt = text.toLowerCase();
    let value = false;
    switch (prompt) {
      case 'confirm':
        this.repeat = false;
        this.speakLang = false;
        this.speakNext = false;
        this.synthServive.stop();
        this.route()
        break;
      case 'confirm.':
        this.repeat = false;
        this.speakLang = false;
        this.speakNext = false;
        this.synthServive.stop();
        this.route()
        break;
      case 'edit.':
        this.synthServive.stop();
        this.repeat = true;
        this.speakLang = false;
        this.speakNext = false;
        this.essayValue = '';
        this.speakAnswer();
        break;
      // case 'edit':
      //   this.repeat = true;
      //   this.synthServive.stop();
      //   this.synthServive.init()
      //   this.essayValue = '';
      //   this.speechSynthesizerEssay.lang = 'en-US';
      //   this.speechSynthesizerEssay.text = 'Please Provide your answer';
      //   speechSynthesis.speak(this.speechSynthesizerEssay);
      //   break;

    }
  }

  speakAnswer()
  {
    if(this.count < 2){
      this.synthServive.stop();
      this.speechSynthesizerEssay.lang = 'en-US';
      this.speechSynthesizerEssay.text = 'Please Provide your answer';
      speechSynthesis.speak(this.speechSynthesizerEssay);
   }
    //this.count = 1;
  }
  route() {
    this.router.navigate(['/image']);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
