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
  constructor(private synthServive :PythonService,private speechSynthesizer: SpeechSynthesizerService,
    private router: Router,

    ) { }
  speakLang = true;

  ngOnInit(): void {
    this.speakLang = true;
  }

  ngAfterViewInit(){
    this.initSynthesis();
    this.callInstruction();
  }

  callInstruction(){
    this.synthServive.callEssay().subscribe(res=>{
      if(res){
        this.synthServive.init()
        this.callMessage();
      }
    })
    
  }
  callMessage(){
    this.synthServive.start();
    setTimeout(() => {
    this.synthServive.stop();
    this.essayValue = this.synthServive.text.trim();
    this.speechSynthesizer.speakEssayPromptEn();
    this.speakEssay(this.essayValue.toString(),'en-US');
    // this.speechSynthesizer.speakQuestionNext();
    this.callMessageConfirm();
    }, 20000);    
  }
  callMessageConfirm(){
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
    this.speechSynthesizerEssay.lang = language;
    this.speechSynthesizerEssay.text = message;
    speechSynthesis.speak(this.speechSynthesizerEssay);
    this.speechSynthesizerEssay.onend = (event) => {
      if(this.speakLang){
        this.callForTamilText();
      }
      if(!this.speakLang){
        this.callNext()
      }
    };
   
  }

  callForTamilText(){
    const data = this.essayValue.replace(/ /g, '');
    console.log(data)
    this.speakLang = true;
    this.synthServive.callTamilText(this.essayValue).subscribe((res)=>{
      if(res){
        console.log(res)
        this.speakLang = false;
        this.speechSynthesizerEssay.lang = 'en-US';
        this.speechSynthesizerEssay.text = 'Say Confirm to proceed to next Question';
        speechSynthesis.speak(this.speechSynthesizerEssay);
      }
    })
  }

  callNext(){
    this.synthServive.start();
    setTimeout(() => {
      this.subscription =  this.synthServive.textBehaviour.subscribe(res => {
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
        // this.synthServive.textBehaviour.unsubscribe();
        this.synthServive.stop();
        this.route()
        //this.speakQuestionNext()
        break;
      case 'confirm.':
        // this.synthServive.textBehaviour.unsubscribe();
        this.synthServive.stop();
        this.route()
        //this.speakQuestionNext()
        break;

    }
  }
  route() {
    this.router.navigate(['/image']);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
