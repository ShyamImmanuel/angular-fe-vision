from flask import Flask, render_template, request, session, redirect, url_for
import pyttsx3
import time
from openai import OpenAI
import base64
import speech_recognition as sr
import re

client = OpenAI(api_key="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")

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

questions = [
    ("What are the values o x?", [],'answer', "math.png"),
    ("Which Country's PC Shipments records are represented in the bar chart?", ['INDIA','RUSSIA','CHINA','USA'],'RUSSIA', "sample0.png"),
    ("What i photosynthesis?", [], 'answer', None)  # New short answer question 
]
    


image_descriptions = {}  # Dictionary to store processed image descriptions

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

import re

# Function to replace words in a sentence
def replace_word_in_sentence(sentence, target_word, replacement_word):
    return re.sub(r'\b%s\b' % re.escape(target_word), replacement_word, sentence, flags=re.IGNORECASE)

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
            # Read back the user's answer
            speak("You said: " + command)
            speak("If you want to make any changes to your answer say edit?")
            change_command = listen_command().lower()
            if change_command == "edit":
                speak("Please say the word or phrase you want to replace followed by the replacement text.")
                change_command = listen_command().lower()
                change_words = change_command.split(' ')  # Split the command into words
                if len(change_words) >= 2:
                    target_word = change_words[0]
                    replacement_word = ' '.join(change_words[1:])
                    # Replace the target word in the answer
                    command = replace_word_in_sentence(command, target_word, replacement_word)
                    print(command)
                    speak("Your answer has been updated.")
                    speak(command)
                else:
                    speak("Sorry, I didn't understand. Please try again.")
            return handle_confirmation(question_number, command, options)
        else:
            return redirect(url_for('result'))  # Redirect to result page if all questions are done

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/result')
def result():
    return render_template('result.html')

if __name__ == '__main__':
    app.run(debug=True)