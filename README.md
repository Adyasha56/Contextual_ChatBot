# ZapCaf — AI Café Chatbot

An AI-powered chatbot for a fictional Indo-Western café, built from scratch using PyTorch and NLTK. Understands natural language queries about menu, delivery, payments, store hours, and more — deployed as a web app with a Flask backend and a clean browser-based UI.

**Live Demo →** [realtime-chatbot-gz8y.onrender.com](https://realtime-chatbot-gz8y.onrender.com)

---

## What It Does

A user types a message like *"What time do you open?"* or *"Do you accept UPI?"* — the system classifies the intent behind the message using a trained neural network and returns the appropriate response. If it's not confident enough, it gracefully says it doesn't understand.

---

## System Design & Data Flow

### Training Pipeline (Offline — run once)

```
intents.json
     │
     │  json.load()
     ▼
[tag, patterns, responses]        ← 13 intents, 70+ pattern sentences
     │
     │  nltk.word_tokenize()
     ▼
Token lists per pattern
     │
     │  PorterStemmer.stem() + filter punctuation + sorted(set())
     ▼
Vocabulary: 54 unique stemmed words   ← the feature space
     │
     │  bag_of_words()  →  binary vector per pattern
     ▼
x_train: (N, 54) float32             ← input features
y_train: (N,)    int                 ← class labels (0–12)
     │
     │  ChatDataset + DataLoader (batch=8, shuffle=True)
     ▼
NeuralNet  →  54 → 8 → 8 → 13
     │
     │  CrossEntropyLoss + Adam (lr=0.001) × 1000 epochs
     ▼
data.pth   ← saved model weights + vocabulary + tags
```

---

### Inference Pipeline (Runtime — per message)

```
User types message
     │
     │  tokenize()          →  word list
     │  stem()              →  root forms
     │  bag_of_words()      →  54-dim binary vector
     ▼
torch.tensor  shape (1, 54)
     │
     │  NeuralNet.forward()
     ▼
Raw logits  shape (1, 13)
     │
     │  torch.max()         →  predicted class index
     │  tags[index]         →  predicted intent tag
     │  torch.softmax()     →  confidence probability
     ▼
confidence > 0.75 ?
     ├── YES → random.choice(intent["responses"])
     └── NO  → "I do not understand..."
     │
     ▼
Response string
```

---

### Web Architecture

```
Browser
  │
  │  GET /          →  Flask serves index.html
  │  POST /predict  →  JSON {message} → JSON {answer}
  ▼
Flask (app_server.py)
  │
  │  get_response(msg)
  ▼
chat.py  →  nltk_utils.py  →  model.py
  │
  └──  data.pth  (loaded once at startup)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Neural Network | PyTorch |
| NLP | NLTK (tokenization), PorterStemmer (stemming) |
| Feature Engineering | Bag-of-Words |
| Web Backend | Flask |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Render.com |

---

## Project Structure

```
RealTime_ChatBot/
│
├── intents.json          # Training data — intents, patterns, responses
├── nltk_utils.py         # tokenize(), stem(), bag_of_words()
├── model.py              # NeuralNet definition (PyTorch)
├── train.py              # Training script → outputs data.pth
├── data.pth              # Saved model + vocabulary
├── chat.py               # Inference engine — get_response()
│
├── app_server.py         # Flask web server
├── app.py                # Original Tkinter desktop app
│
├── static/
│   ├── style.css         # All CSS
│   ├── script.js         # Chat UI logic
│   ├── zappy.png         # Hero image
│   └── zap_Robo.png      # Chat mascot
│
├── templates/
│   └── index.html        # Web frontend
│
├── render.yaml           # Render deployment config
├── requirements.txt      # Python dependencies
└── QnA.md                # Interview Q&A reference
```

---

## Neural Network Architecture

```
Input Layer     →  54 neurons  (bag-of-words vocabulary size)
Hidden Layer 1  →   8 neurons  + ReLU
Hidden Layer 2  →   8 neurons  + ReLU
Output Layer    →  13 neurons  (one per intent class)

Total trainable parameters: 54×8 + 8 + 8×8 + 8 + 8×13 + 13 = 645
Loss function: CrossEntropyLoss
Optimizer: Adam (lr=0.001)
Epochs: 1000
```

---

## Intents Covered

| Intent | Example Query |
|---|---|
| greeting | "Hi", "Hello", "Good morning" |
| goodbye | "Bye", "See you later" |
| thanks | "Thanks", "Much appreciated" |
| items | "What do you sell?" |
| payments | "Do you accept UPI?" |
| delivery | "How long does delivery take?" |
| funny | "Tell me a joke!" |
| store_hours | "What time do you open?" |
| menu | "Show me the menu" |
| reservations | "Can I book a table?" |
| complaints | "My order was wrong" |
| location | "Where are you located?" |
| offers | "Any discounts today?" |

---

## Run Locally

```bash
# Clone
git clone https://github.com/Adyasha56/RealTime_ChatBot.git
cd RealTime_ChatBot

# Install dependencies
pip install -r requirements.txt

# Train the model (only needed if intents.json changes)
python train.py

# Start the web server
python app_server.py
```

Open `http://127.0.0.1:10000` in your browser.

---

## Retrain the Model

To add new intents, edit `intents.json` following the existing structure, then run:

```bash
python train.py
```

This regenerates `data.pth`. No other files need to change.

---

## License

MIT License — free to use, modify, and distribute.
