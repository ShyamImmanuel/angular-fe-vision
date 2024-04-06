import { Component, NgZone, OnInit } from '@angular/core';
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
  questions = "What total percentage of Indian tourist went to  USA and UK?"; 
  //  Option One : 'INDIA',Option two :'RUSSIA',Option three'CHINA', Option Four:  'USA'";
  options = ['40%','50%','70%','80%'];

  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive: PythonService, private speechSynthesizer: SpeechSynthesizerService,private ngZone: NgZone,
    private router: Router,

  ) { }
  speakLang = true;
  selectedOption = 0;
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
    //this.callOptionsQuestions();
  }

  callInstruction() {
    this.synthServive.callImage().subscribe(res => {
      if (res) {
        setTimeout(() => {
          this.callOptionsQuestions()
        }, 3000);
        //this.callMessage();
      }
    })

  }

 async callOptionsQuestions(){
     await this.speak('You wil Now Answer Questions Related to Chart','en-US');
     await this.speak('Your question is as follows','en-US');
     await this.speak(this.questions,'en-US');
     await this.speak('Your options are','en-US');
     
      for(let i=0; i<this.options?.length; i++){
        const text = this.options[i];
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
      //this.speechSynthesizer.speakEssayPromptEn();
      this.checkOptionMatch(this.option.toString());
      this.speakLang = true;
      this.speakEssay("The Anwer You have Provided is  " +this.option.toString(), 'en-US');
      // this.speechSynthesizer.speakQuestionNext();
    }, 5000);
  }

  checkOptionMatch(option: string){
    const value = option.trim();
    let index =0;
    this.selectedOption = 2;
    console.log(this.selectedOption);
  }

  speakEssay(message: string, language: string): void {
    this.initSynthesis();
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
    this.synthServive.text='';
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
        this.speak('Moving to next question','en-US');
        this.routeToNext()
        break;
      case 'confirm.':
        this.synthServive.stop();
        this.speak('Moving to next question','en-US');
        this.routeToNext()
        break;
      case 'previous.':
        this.synthServive.stop();
        this.speak('Moving to previous question','en-US');
        this.routeToPrevious()
        break;
      case 'back.':
        this.synthServive.stop();
        this.speak('Moving to previous question','en-US');
        this.routeToPrevious()
        break;

    }
  }

  routeToPrevious() {
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
   //this.router.navigate(['/question']);
   this.navigateTo('/question')
  }
  questionNext(){
    //this.router.navigate(['/essay']);
    this.navigateTo('/essay')
   }
 
  routeToNext() {
    setTimeout(async () => {
      this.questionNext()
    }, 5000);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

}
