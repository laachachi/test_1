from flask import Flask, request, jsonify
from flask_cors import CORS
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

# Initialiser Flask
app = Flask(__name__)
CORS(app)

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Charger le modèle de transformation de phrases
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Charger l'index FAISS
index = faiss.read_index("faiss_index.bin")

# Charger les questions/réponses
with open("qa_data.pkl", "rb") as f:
    data = pickle.load(f)
questions = data["questions"]
answers = data["answers"]

# Fonction de recherche de la meilleure correspondance
def get_best_match(user_question):
    user_embedding = model.encode([user_question])
    D, I = index.search(np.array(user_embedding, dtype=np.float32), 1)
    distance = D[0][0]

    # Si la distance est élevée (> 0.5), afficher un message (au lieu d'enregistrer)
    if distance > 0.5:
        logging.info(f"⚠️ Question non trouvée (distance > 0.5): '{user_question}' (distance: {distance:.4f})")
        return "Je suis désolé 😞, je n'ai pas encore la réponse. Pourriez-vous la reformuler 🔄 ?"

    return answers[I[0][0]]

# Route principale /chat
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_question = data.get("question", "")
    if not user_question:
        return jsonify({"answer": "Veuillez poser une question."})

    response = get_best_match(user_question)
    return jsonify({"answer": response})

# Lancer l'application Flask
if __name__ == "__main__":
    logging.info("🚀 Démarrage de l'application Flask")
    app.run(debug=True)