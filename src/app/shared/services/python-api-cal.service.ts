import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
// import { request } from 'https';

@Injectable({
  providedIn: 'root',
})
export class PythonService {

  constructor(private http:HttpClient) {
  }

  recognition =  new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  public text = '';
  tempWords:any;
  textBehaviour = new BehaviorSubject('')



  init() {

    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.textBehaviour = new BehaviorSubject('')
    this.text = '';
    this.tempWords = '';
    this.recognition.addEventListener('result', (e:any) => {
      const transcript = Array.from(e.results)
        .map((result:any) => result[0])
        .map((result) => result.transcript)
        .join('');
      this.tempWords = transcript;
      this.textBehaviour.next(this.tempWords.trim())
      console.log(transcript);
    });
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    console.log("Speech recognition started")
    this.recognition.addEventListener('end', (condition:any) => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
        console.log("End speech recognition")
      } else {
        this.wordConcat()
        this.recognition.start();
      }
    });
  }
  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat()
    this.recognition.stop();
    console.log("End speech recognition")
  }

  wordConcat() {
    this.text = this.text +' '+this.tempWords;
    this.tempWords = '';
    console.log(this.text)
  }
  callInstruction(){
    return this.http.get('http://127.0.0.1:5000/instruction')
  }

  callConfirm(){
    return this.http.get('http://127.0.0.1:5000/confirm')
  }
  callMessage(){
    return this.http.get('http://127.0.0.1:5000/message')
  }

  callEssay(){
    return this.http.get('http://127.0.0.1:5000/essay')
  }

  callAnswerEssay(){
    return this.http.get('http://127.0.0.1:5000/answer')
  }

  callTamilText(data: any){
    const params = new HttpParams().set('type', data);
    return this.http.get('http://127.0.0.1:5000/synthesize_data',{params:params})

  }
// async callTamilText(data: any){
//     const options = {
//         method: 'POST',
//         uri: 'http://127.0.0.1:5000/synthesize_data',
//         body: data,
//         json: true
//     };
//     try {
//         const parsedBody = await request(options);
//         console.log(parsedBody);
//         // You can do something with
//         // returned data
//         let result;
//         console.log("Sum of Array from Python: ", result);
//         return result;
//       } catch (err) {
//         console.log(err);
//         return err;

//     }
// }
   
}
