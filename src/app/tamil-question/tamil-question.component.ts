import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PythonService } from '../shared/services/python-api-cal.service';
import { SpeechSynthesizerService } from '../shared/services/web-apis/speech-synthesizer.service';
import { AudioRecordingService } from '../shared/services/audio-recordiing-service';
import { OpenaiChatGPTService } from '../shared/services/openai-chatgpt-service';

@Component({
  selector: 'wsa-tamil-question',
  templateUrl: './tamil-question.component.html',
  styleUrls: ['./tamil-question.component.css']
})
export class TamilQuestionComponent implements OnInit {

  question = 'சந்திரயான் பற்றிய குறிப்பு வரைக';
  questionEnglish = 'Note on Chandrayaan ';
  essayValue: any;
  speechSynthesizerEssay!: SpeechSynthesisUtterance;
  subscription: Subscription = new Subscription;
  conversionText!: string;
  isSkeletonLoading: boolean = false;
  recordedBlobSubscription: Subscription = new Subscription;

  

  initSynthesis(): void {
    this.speechSynthesizerEssay = new SpeechSynthesisUtterance();
    this.speechSynthesizerEssay.volume = 1;
    this.speechSynthesizerEssay.rate = 1;
    this.speechSynthesizerEssay.pitch = 0.2;
  }
  constructor(private synthServive :PythonService,private speechSynthesizer: SpeechSynthesizerService,
    private router: Router,private audioRecordingService: AudioRecordingService, private openaiChatGPTService: OpenaiChatGPTService

    ) { }
  speakLang = true;

  ngOnInit(): void {
    this.speakLang = true;
  }

  ngAfterViewInit(){
    this.initSynthesis();
    this.callInstruction();
    //this.callTamilListen()
    //this.startRecording();
  }
  startRecording(): void {
    // start audio recording
    this.audioRecordingService.startRecording();
    setTimeout(() => {
      this.stopRecording();
    }, 20000);
  }

  // stop recording
  stopRecording(): void {
    // stop audio recording
    this.audioRecordingService.stopRecording();
    this.isSkeletonLoading = true;
    this.recordedBlobSubscription = this.audioRecordingService.getRecordedBlob().subscribe(async response => {
      // create file object from recorded blob
      const audioFile = new File([response.blob], response.title, { type: "audio/mpeg" });
      // speech to text conversion API call
      const data = new FormData();
      
      data.append('audio_file', audioFile);
     
      this.openaiChatGPTService.speechToTextCoversion(data).then((res:any) => {
        if (res) {
          console.log(res)
          // this.conversionText = res.result;
          this.isSkeletonLoading = false;
        }
      }, (err: any) => {
        console.log(err);
        this.recordedBlobSubscription.unsubscribe();
    });
    })
  }


  callInstruction(){
    this.questionEnglish.replace(/ /g, '');
    this.synthServive.callTamilText(this.questionEnglish).subscribe(res=>{
      if(res){
        this.synthServive.init()
        this.callTamilListen();
      }
    })
    
  }
  callTamilListen(){
    this.synthServive.callTamilQuestion().subscribe(res=>{
      if(res){
        console.log(res)
        this.essayValue = res;
        this.callForTamilText();
        // this.synthServive.init()
        // this.callMessage();
      }
    })
    
  }
  callMessage(){
    // this.synthServive.start();
    // setTimeout(() => {
    // this.synthServive.stop();
    // this.essayValue = this.synthServive.text.trim();
    // this.speechSynthesizer.speakEssayPromptEn();
    // this.speakEssay(this.essayValue.toString(),'en-US');
    // this.callMessageConfirm();
    // }, 20000);    
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
    // const data = this.essayValue.replace(/ /g, '');
    // console.log(data)
    // this.speakLang = true;
    const data = 'Say Confirm to proceed to next Question';
    data.replace(/ /g, '');
    this.synthServive.callTamilTextf(data).subscribe((res)=>{
      if(res){
        console.log(res)
        this.callNext();
        // this.speakLang = false;
        // this.speechSynthesizerEssay.lang = 'en-US';
        // this.speechSynthesizerEssay.text = 'Say Confirm to proceed to next Question';
        // speechSynthesis.speak(this.speechSynthesizerEssay);
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
