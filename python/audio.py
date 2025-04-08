from openai import OpenAI
from deep_translator import GoogleTranslator
import os
from playsound import playsound
from flask import Flask, render_template, request, session, redirect, url_for,jsonify
from flask_cors import CORS





app = Flask(__name__)
cors = CORS(app, resources={r"/*":{"origins":"*"}})

def speek_tamil(text):
    with client.audio.speech.with_streaming_response.create(
        model="tts-1",
        voice="alloy",
        input=text,
    ) as response:
        response.stream_to_file("speech.mp3")
        file_url ="file://" + os.path.abspath("speech.mp3")
        return file_url

# Translate text from English to Tamil- text to text
question_tamil = GoogleTranslator(source='auto', target='ta').translate("What is the capital of India?")

file_path = speek_tamil(question_tamil)
print(file_path)
playsound(file_path)

@app.route("/synthesize_data", methods=['GET', 'POST'])
def datasynthesize():
    data = request.get_json()
    if data:
        question_tamil = GoogleTranslator(source='auto', target='ta').translate(data)
        print(question_tamil)
    return "TEST"

if __name__ == '__main__':
    app.run(debug=True)