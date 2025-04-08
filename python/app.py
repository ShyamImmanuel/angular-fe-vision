from flask import Flask, render_template, request, session, redirect, url_for
import pyttsx3
import time
from openai import OpenAI
import base64
import speech_recognition as sr
# client = OpenAI(api_key="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")

app = Flask(__name__)
# app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

questions = [
    ("What is the capital of France?", [], 'paris', None),  # New short answer question 
    ("Which Country's PC Shipments records are represented in the bar chart?", ['INDIA','RUSSIA','CHINA','USA'],'RUSSIA', "sample0.png"),
    ("Base language of web?", ['JavaScript', 'ASP', 'PHP', 'HTML'], 'HTML', None)
]
    

'''("Which is not a programming language?", ['Python', 'HTML', 'Scala', 'Java'], 'HTML', None),
    ("Secondary memory is also called?", ['Virtual memory', 'RAM', 'ROM', 'Hard drives'], 'ROM', None),
    ("Functions that are used to get the length of a string in Python?", ['count', 'length', 'dis', 'len'], 'len', None),
    ("Which is not a web framework?", ['Django', 'React', 'Numpy', 'Angular'], 'Numpy', None),
]'''

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
        max_tokens=500,
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
    
    speak(f"You said {command}. Say 'confirm' to select this option or 'redo' to repeat the question.")
    confirmation_attempts = 2  # Allow 2 attempts for confirmation
    for _ in range(confirmation_attempts):
        confirmation_command = listen_command().lower()  # Ensure lowercase confirmation
        if confirmation_command == "confirm":
            if options:  # Check if options are provided
                print("Recognized option:", command)
                print("Available options:", options)
                if command.lower() in [option.lower() for option in options]:  # Check if the command matches any of the options
                    selected_option = command.lower()  # Convert to lowercase for case-insensitive comparison
                    _, _, correct_answer, _ = questions[question_number - 1]
                    if selected_option == correct_answer.lower():  # Compare with lowercase correct answer
                        session['score'] = session.get('score', 0) + 1

                    if question_number < len(questions):
                        return redirect(url_for('question', question_number=question_number + 1))
                    else:
                        return redirect(url_for('result'))
                else:
                    speak("That option is not available. Please choose from the provided options or say 'redo'.")
            else:  # Short answer question
                _, _, correct_answer, _ = questions[question_number - 1]
                if command.lower() == correct_answer.lower():  # Check if the command matches the correct answer
                    session['score'] = session.get('score', 0) + 1

                if question_number < len(questions):
                    return redirect(url_for('question', question_number=question_number + 1))
                else:
                    return redirect(url_for('result'))
        elif confirmation_command == "redo":
            return redirect(url_for('question', question_number=question_number))
        else:
            if _ < confirmation_attempts - 1:
                speak(f"I didn't recognize that option. Please say 'confirm' or 'redo'. You have {confirmation_attempts - (_ + 1)} attempts remaining.")
            else:
                speak("Sorry, I couldn't understand your confirmation after multiple attempts. Please repeat the question using 'redo'.")
                return redirect(url_for('question', question_number=question_number))
    return None  # Should not reach here, but added for completeness

@app.route('/')
def index():
    return render_template('index.html')

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
            return redirect(url_for('index'))

@app.route('/result')
def result():
    score = session.get('score', 0)
    session.pop('score', None)
    return render_template('result.html', score=score)

if __name__ == '__main__':
    app.run(debug=True)
