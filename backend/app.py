from flask import Flask, request, jsonify
from recommender import recommend
from flask_cors import CORS

app = Flask(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Backend is running!"

@app.route('/recommend', methods=['POST'])
def recommend_api():
    data = request.get_json()
    ingredients = data.get('ingredients', [])

    results = recommend(ingredients)

    response = results.to_dict(orient='records')

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)