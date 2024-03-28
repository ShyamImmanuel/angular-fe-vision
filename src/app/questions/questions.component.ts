import { Component, OnInit } from '@angular/core';
import { PythonService } from '../shared/services/python-api-cal.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';

@Component({
  selector: 'wsa-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  essayValue: any;
  speechSynthesizerEssay!: SpeechSynthesisUtterance;

  

  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive :PythonService,private speechSynthesizer: SpeechSynthesizerService
    ) { }

  ngOnInit(): void {
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
      this.callForTamilText();
      console.log(
        `Utterance from component ${event.elapsedTime} seconds.`,
      );
    };
   
  }

  callForTamilText(){
    const data = this.essayValue.replace(/ /g, '');
    console.log(data)
    this.synthServive.callTamilText(this.essayValue).subscribe((res)=>{
      if(res){
        console.log(res)
      }
    })
  }
}
