import speech_recognition as sr
import wave
import gtts as gt 
from io import BytesIO
from pydub import AudioSegment
from pydub.playback import play

import os  # For file removal
from deep_translator import GoogleTranslator
from openai import OpenAI
from flask import Flask, render_template, request, session, redirect, url_for,jsonify
from flask_cors import CORS
# import streamlit as st
# from audio_recorder_streamlit import audio_recorder
import sounddevice as sd
from scipy.io.wavfile import write
import wavio as wv


app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
cors = CORS(app, resources={r"/*":{"origins":"*"}})


client = OpenAI(api_key="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")
'''#for ts
def speek_tamil(text):
    with client.audio.speech.with_streaming_response.create(
        model="tts-1",
        voice="alloy",
        input=text,
    ) as response:
        response.stream_to_file("speech.mp3")
'''

#text to speech
def speek_tamil(transcription):
  tts = gt.gTTS(text=transcription, lang='ta')
  audio_stream = BytesIO()
  tts.write_to_fp(audio_stream)
  audio_stream.seek(0)

  # Load audio from BytesIO object
  audio = AudioSegment.from_file(audio_stream, format="mp3")

  # Play the audio
  play(audio)

@app.route("/api/essay")
def transcribe_from_mic():
  """Transcribes speech from the microphone using the OpenAI Whisper API."""
  print("Speak now...")
  recognizer = sr.Recognizer()
  with sr.Microphone() as source:
    print("Speak now...")
    audio = recognizer.listen(source)

  try:
    # Convert audio data to WAV format
    # with wave.open("temp.wav", "wb") as wav_file:
    #   wav_file.setnchannels(1)
    #   wav_file.setsampwidth(2)  # Adjust for 16-bit audio if needed
    #   wav_file.setframerate(16000)  # Adjust for your recording sample rate (e.g., 44100)
    #   wav_file.writeframes(audio.frame_data)

    print("conversion now...")

    # Send WAV file to OpenAI Whisper API for transcription
    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=open("temp.wav", "rb"),  # Use open() for WAV file
        response_format="text",
        language="ta"  # Adjust language as needed
    )

    print(response)
    return jsonify(response)

  except Exception as e:
    print(f"Error: {e}")

# question_tamil = GoogleTranslator(source='auto', target='ta').translate("What is the capital of India?")
# speek_tamil(question_tamil)
# answer=transcribe_from_mic()
# speek_tamil(answer)
@app.route("/synthesize_data", methods=['GET', 'POST'])
def datasynthesize():
    data = request.get_json()
    print(data)
    if data:
        print(data)
        # question_tamil = GoogleTranslator(source='auto', target='ta').translate(data)
        # speek_tamil(question_tamil)
        # tts = gt.gTTS(text=transcription, lang='ta')
        # audio_stream = BytesIO()
        # tts.write_to_fp(audio_stream)
        # audio_stream.seek(0)
        # # Load audio from BytesIO object
        # audio = AudioSegment.from_file(audio_stream, format="mp3")
        # # Play the audio
        # play(audio)
    return jsonify({'C': ['C']})

def __main__():
  # Sampling frequency
  print("now1...")
  freq = 44100
  duration = 10
  print("now2...")
  recording = sd.rec(int(duration * freq),samplerate=freq, channels=2)
  sd.wait()
  print("recording0 now...")
  write("recording0.wav", freq, recording)
  print("recording1 now...")
# Convert the NumPy array to audio file
  wv.write("recording1.wav", recording, freq, sampwidth=2)
  print("conversion now...")
 
if __name__ == '__main__':
    app.run(debug=True)