import React, { useState } from "react";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const ingredientList = ingredients.split(",").map(i => i.trim());

    setLoading(true); // 🔥 START LOADING

    try {
      const API_URL =import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients: ingredientList })
      });

      const data = await response.json();
      setRecipes(data);
      setSelectedRecipe(null);

    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false); // 🔥 STOP LOADING
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col items-center">

      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Food Recommendation System
      </h1>

      <p className="text-gray-600 mb-6">
        Discover recipes based on ingredients you have
      </p>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="onion, tomato, potato"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="px-4 py-2 w-80 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-5 py-2 rounded-lg shadow transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* 🔥 LOADING TEXT + SPINNER */}
      {loading && (
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Finding the best recipes for you...</p>
        </div>
      )}

      {/* Selected Recipe */}
      {selectedRecipe && !loading && (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8 border">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedRecipe.name}
          </h2>

          <p className="text-green-600 font-semibold mb-4">
            Match: {selectedRecipe.similarity.toFixed(2)}%
          </p>

          <h3 className="font-semibold text-gray-700 mb-2">Ingredients</h3>
          <ul className="list-disc ml-6 text-gray-600 mb-4">
            {selectedRecipe.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>

          <h3 className="font-semibold text-gray-700 mb-2">Missing Ingredients</h3>

          {selectedRecipe.missing_ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRecipe.missing_ingredients.map((item, i) => (
                <span
                  key={i}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-green-600 mb-4">
              You have all required ingredients
            </p>
          )}

          <h3 className="font-semibold text-gray-700 mb-2">Instructions</h3>
          <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 leading-relaxed whitespace-pre-line mb-4">
            {selectedRecipe.instructions}
          </div>

          <a
            href={selectedRecipe.youtube_link}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Watch on YouTube
          </a>
        </div>
      )}

      {/* Recipe Cards */}
      {!loading && recipes.length > 0 && (
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Recommended Recipes
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {recipes.map((recipe, index) => (
              <div
                key={index}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition cursor-pointer border hover:border-blue-400"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {recipe.name}
                </h3>

                <p className="text-sm text-green-600 font-semibold mb-2">
                  Match: {recipe.similarity.toFixed(2)}%
                </p>

                <p className="text-gray-600 text-sm mb-2">
                  {recipe.ingredients.slice(0, 5).join(", ")}...
                </p>

                <p className="text-blue-500 text-sm font-medium">
                  Click to view details
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;