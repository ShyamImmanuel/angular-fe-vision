from flask import Flask, render_template, request, session, redirect, url_for,jsonify
import pyttsx3
import time
from openai import OpenAI
import base64
import speech_recognition as sr
from flask_cors import CORS
from deep_translator import GoogleTranslator
import os
from playsound import playsound
import sounddevice as sd
from scipy.io.wavfile import write
import wavio as wv
import numpy as np
import noisereduce as nr
# import gtts as gt 
# from io import BytesIO
# from pydub import AudioSegment
# from pydub.playback import play

# client = OpenAI(api_key="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")

app = Flask(__name__)
# app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
cors = CORS(app, resources={r"/*":{"origins":"*"}})

questions = [
    ("What are the values o x?", [],'answer', "math.png"),
    ("Which Country's PC Shipments records are represented in the bar chart?", ['INDIA','RUSSIA','CHINA','USA'],'RUSSIA', "sample0.png"),
    ("What i photosynthesis?", [], 'answer', None)  # New short answer question 
]
    


image_descriptions = {}  # Dictionary to store processed image descriptions

freq = 44100
duration = 10
new_rate = 180



def speek_tamil(text,file_name):
    with client.audio.speech.with_streaming_response.create(
        model="tts-1",
        voice="fable",
        input=text,
    ) as response:
        response.stream_to_file(file_name)
        file_url ="file://" + os.path.abspath(file_name)
        return file_url



def get_image_description(image_path):
    if image_path in image_descriptions:
        return image_descriptions[image_path]

    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')

    response = client.chat.completions.create(
        model='gpt-4-vision-preview',
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Can you describe this image?"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}",
                        },
                    }
                ],
            }
        ],
        max_tokens=300,
    )
    image_description = response.choices[0].message.content
    print(image_description)
    image_descriptions[image_path] = image_description
    return image_description

# Speech synthesis
def speak(text):
    engine = pyttsx3.init()
    engine.setProperty('rate', new_rate)
    engine.say(text)
    engine.runAndWait()

# Speech recognition
def listen_command(timeout=15):
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        try:
            audio = recognizer.listen(source, timeout=timeout)  # Timeout after 15 seconds
            command = recognizer.recognize_google(audio).lower()
            print("Command:", command)
            return command
        except sr.WaitTimeoutError:
            print("Listening timed out.")
        except sr.UnknownValueError:
            print("Sorry, I didn't understand that.")
        except sr.RequestError as e:
            print("Error:", e)
    return None

def handle_confirmation(question_number, command, options):
    if command is None:
        speak("Sorry, I didn't catch that. Please repeat your answer.")
        return redirect(url_for('question', question_number=question_number))

    speak(f"You said: {command}. Say 'confirm' to select this option or 'redo' to repeat the question.")
    confirmation_command = listen_command().lower()  # Ensure lowercase confirmation
    if confirmation_command == "confirm":
        _, _, correct_answer, _ = questions[question_number - 1]
        if command.lower() == correct_answer.lower():  # Compare with lowercase correct answer
            session['score'] = session.get('score', 0) + 1

        if question_number < len(questions):
            return redirect(url_for('question', question_number=question_number + 1))
        else:
            return redirect(url_for('result'))
    elif confirmation_command == "redo":
        return redirect(url_for('question', question_number=question_number))
    else:
        speak("Sorry, I didn't understand your confirmation. Please repeat the question.")
        return redirect(url_for('question', question_number=question_number))


@app.route('/question/<int:question_number>', methods=['GET', 'POST'])
def question(question_number):
  if request.method == 'POST':
    selected_option = request.form['options']
    _, _, correct_answer, _ = questions[question_number - 1]

    if selected_option == correct_answer:
      session['score'] = session.get('score', 0) + 1

    if question_number < len(questions):
      return redirect(url_for('question', question_number=question_number + 1))
    else:
      return redirect(url_for('result'))

  else:
    if question_number <= len(questions):
      question_text, options, correct_answer, image_path = questions[question_number - 1]
      speak(question_text)
      if image_path:  # Check if image path is provided
        image_description = get_image_description(image_path)
        speak("Image description: " + image_description)
      if options:  # If options are provided
        speak("Options are " + ", ".join(options))
      else:  # Short answer question
        time.sleep(1)  # Wait for 15 seconds for answer

      command = listen_command()
      return handle_confirmation(question_number, command, options)
    else:
      return redirect(url_for('result'))  # Redirect to result page if all questions are done

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/result')
def result():
    return render_template('result.html')

@app.route('/instruction')
def call():
    speak('Please Select Instruction Speed for the Exam.')
    speak('Slow')
    speak('Medium')
    speak('Fast')
    return jsonify({'C': ['C']})

@app.route('/essay')
def essay():
    speak('Give a view about Python.')
    return jsonify({'C': ['C']})

@app.route('/confirm')
def confirm():
    speak('Say Confirm to proceed.')
    return jsonify({'C': ['C']})

@app.route('/answer')
def answer():
    delay = 60*1 # For 1 minute delay 
    close_time = time.time()+delay
    while True:
    # ...
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening...")
            try:
                audio = recognizer.listen(source, timeout=15)  # Timeout after 15 seconds
                command = recognizer.recognize_google(audio).lower()
                print("Command:", command)
                if time.time() > close_time:
                    return jsonify(command)
                    break
            except sr.WaitTimeoutError:
                print("Listening timed out.")
            except sr.UnknownValueError:
                print("Sorry, I didn't understand that.")
            except sr.RequestError as e:
                print("Error:", e)
        return None
    # speak('Please Provide your Answer')
    # time.sleep(3)  # Wait for 1 second after reading the question
    # recognizer = sr.Recognizer()
    # with sr.Microphone() as source:
    #     print("Listening...")
    #     recognizer.adjust_for_ambient_noise(source)
    #     audio = recognizer.listen(source, timeout=60)  # Timeout after 60 seconds
    #     try:
    #         while True:
    #             command = recognizer.recognize_google(audio).lower()
    #             print("Command:", command)
    #             return jsonify(command)
    #     except KeyboardInterrupt:
    #         print("Listening timed out.")


@app.route('/message')
def listen():
    command = listen_command()
    print("Recognized option:", command)
    if command == "confirm":
        print("Recognized option:", command)
        return jsonify(command)

@app.route("/api/synthesize_data", methods=['GET', 'POST'])
def datasynthesize():
    data = request.args.get('type')
    if data:
        print(data)
        # tts = gt.gTTS(text=data, lang='ta')
        # audio_stream = BytesIO()
        # tts.write_to_fp(audio_stream)
        # audio_stream.seek(0)
        # # Load audio from BytesIO object
        # audio = AudioSegment.from_file(audio_stream, format="mp3")
        # # Play the audio
        # play(audio)
        question_tamil = GoogleTranslator(source='auto', target='ta').translate(data)
        file_path = speek_tamil(question_tamil,"speech.mp3")
        print(file_path)
        playsound(file_path)
        print(question_tamil)
    return jsonify({'C': ['C']})

@app.route("/api/synthesize_dataf", methods=['GET', 'POST'])
def synthesize_dataf():
    data = request.args.get('type')
    if data:
        print(data)
        # tts = gt.gTTS(text=data, lang='ta')
        # audio_stream = BytesIO()
        # tts.write_to_fp(audio_stream)
        # audio_stream.seek(0)
        # # Load audio from BytesIO object
        # audio = AudioSegment.from_file(audio_stream, format="mp3")
        # # Play the audio
        # play(audio)
        question_tamil = GoogleTranslator(source='auto', target='ta').translate(data)
        file_path = speek_tamil(question_tamil,"confirm.mp3")
        print(file_path)
        playsound(file_path)
        print(question_tamil)
    return jsonify({'C': ['C']})


@app.route('/api/image')
def image():
    image_description = get_image_description("tourist.PNG")
    print(image_description)
    if image_description:
        speak('Now You will Hear the Descripton of the Chart.')
        print(image_description)
        speak(image_description)
    # return jsonify({image_description})
    return jsonify({'C': ['C']})

@app.route('/api/tessay')
def tessay():
  # Sampling frequency
  print("now1...")
  print("now2...")
  recording = sd.rec(int(duration * freq),samplerate=freq, channels=2)
  sd.wait()
  print("recording0 now...")
  write("recording0.wav", freq, recording)
  print("recording1 now...")
  wv.write("recording1.wav", recording, freq, sampwidth=2)

#   wav_file = "recording1.wav"
#   wav_data = wv.read(wav_file)
#   sample_rate = wav_data.rate
#   # Extract audio data
#   audio_data = wav_data.data.flatten()
# # Perform noise reduction
#   reduced_audio = nr.reduce_noise(y=audio_data, sr=freq)

# # Save the reduced audio to a new WAV file
#   output_file = "reduced_audio.wav"
  print("conversion now...")
  response = client.audio.transcriptions.create(
        model="whisper-1",
        file=open("recording1.wav", "rb"),  # Use open() for WAV file
        response_format="text",
        language="ta")
  print(response)
  question_tamil = GoogleTranslator(source='auto', target='ta').translate("Your  Answer")
  file_path = speek_tamil(question_tamil,"answer1.mp3")
  print(file_path)
  playsound(file_path)
#   answer_tamil = response
#   file_path = speek_tamil(answer_tamil,"answer2.mp3")
#   print(file_path)
 
  file_url = os.path.abspath("recording1.wav")
  playsound(file_url)
#   return jsonify(response)
  return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)