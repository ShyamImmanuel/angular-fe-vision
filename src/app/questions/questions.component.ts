import { Component, NgZone, OnInit } from '@angular/core';
import { PythonService } from '../shared/services/python-api-cal.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SpeechRecognitionService } from '../shared/services/seepc-service';

@Component({
  selector: 'wsa-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  essayValue: any;
  speechSynthesizerEssay!: SpeechSynthesisUtterance;
  subscription: Subscription = new Subscription;
  checkArr=['confirm.','confirm','edit','edit.']



  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive: PythonService, private speechSynthesizer: SpeechSynthesizerService,private spec:SpeechRecognitionService,
    private router: Router,private ngZone: NgZone

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
    setTimeout(() => {
      this.callInstruction();
    }, 3000);
  }

  callInstruction() {
    this.synthServive.callEssay().subscribe(res => {
      if (res) {
        this.synthServive.init();
        this.callMessage();
      }
    })

  }
  async callMessage() {
    this.repeat = false;
    this.speakLang = false;
    this.speakNext = false;    
    this.synthServive.start();
    setTimeout(async () => {
      this.synthServive.stop();
      this.essayValue = this.synthServive.text.trim();
      this.speakLang = true;
      await this.speak(this.essayValue.toString(), 'en-US')
      await this.speak('Say Confirm to proceed or Edit to Change your answer','en-US')
      this.callNext();
    }, 10000);
    
  }
  async callMessageConfirm() {
 
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
    this.spec.startRecognition();
    this.speakLang = false;
    this.repeat = false;
    this.speakNext = false;
    this.count = 0;
    // setTimeout(() => {
      this.spec.setOnResult((result) => {
       console.log('result',result);
       if(this.checkArr.includes(result.toLowerCase())){
        this.spec.stopRecognition();
        this.checkPromptedText(result.trim());
       }
      });
    // }, 3000);
  }

  checkPromptedText(text: string) {
    const prompt = text.toLowerCase();
    let value = false;
    switch (prompt) {
      case 'confirm':
        this.repeat = false;
        this.speakLang = false;
        this.speakNext = false;
        this.spec.stopRecognition();
        this.speak('Moving to next question','en-US');
        this.route()
        break;
      case 'confirm.':
        this.repeat = false;
        this.speakLang = false;
        this.speakNext = false;
        this.spec.stopRecognition();
        this.speak('Moving to next question','en-US');
        this.route()
        break;
      case 'edit.':
        this.synthServive.stop();
        this.repeat = true;
        this.speakLang = false;
        this.speakNext = false;
        this.essayValue = '';
        this.spec.stopRecognition();
        this.speakAnswer()
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

  async speakAnswer()
  {
      this.synthServive.stop();
      this.synthServive.text ='';
      // this.speechSynthesizerEssay.lang = 'en-US';
      // this.speechSynthesizerEssay.text = 'Please Provide your answer';
      // speechSynthesis.speak(this.speechSynthesizerEssay);
      await this.speak('Please Provide your answer','en-US');
      await this.callMessage();
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
  route() {
    setTimeout(async () => {
      this.question()
    }, 5000);
  }
  navigateTo(url: string): void {
    this.ngZone.run(() => {
      this.router.navigateByUrl(url);
    });
  }
   question(){
   // this.router.navigate(['/image']);
   this.navigateTo('/image');
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
