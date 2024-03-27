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
  constructor(private synthServive :PythonService,private speechSynthesizer: SpeechSynthesizerService
    ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
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
    this.essayValue = this.synthServive.text;
    this.speechSynthesizer.speakEssayPromptEn();
    this.speechSynthesizer.speak(this.essayValue.toString(),'en-US');
    // this.speechSynthesizer.speakQuestionNext();
    }, 30000);    
  }
}
