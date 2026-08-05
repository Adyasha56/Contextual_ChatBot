from flask import Flask, request, jsonify, render_template
from chat import get_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    text = request.get_json().get("message")
    if not text:
        return jsonify({"answer": "Please say something!"}), 400
    response = get_response(text)
    return jsonify({"answer": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
