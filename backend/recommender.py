import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
df = pd.read_csv("data/recipes.csv")

# Rename columns
df = df.rename(columns={
    'TranslatedRecipeName': 'name',
    'Cleaned-Ingredients': 'ingredients',
    'TranslatedInstructions': 'instructions',
    'image-url':'image'
})

# Keep only required columns
df = df[['name', 'ingredients', 'instructions']]

# Drop missing values
df = df.dropna()

# Convert ingredients string → list safely
df['ingredients'] = df['ingredients'].apply(
    lambda x: x.split(',') if isinstance(x, str) else []
)

# Clean ingredients
df['ingredients'] = df['ingredients'].apply(
    lambda x: [i.strip().lower() for i in x]
)

# YouTube link generator
def get_youtube_link(recipe_name):
    query = recipe_name.replace(" ", "+")
    return f"https://www.youtube.com/results?search_query={query}"

df['youtube_link'] = df['name'].apply(get_youtube_link)

# Create ingredient vocabulary
all_ingredients = set()

for ing_list in df['ingredients']:
    for ing in ing_list:
        all_ingredients.add(ing)

all_ingredients = list(all_ingredients)

def vectorize(ingredients):
    return [1 if item in ingredients else 0 for item in all_ingredients]

df['vector'] = df['ingredients'].apply(vectorize)

# 🆕 NEW FUNCTION (missing ingredients)
def get_missing_ingredients(user_input, recipe_ingredients):
    return list(set(recipe_ingredients) - set(user_input))


# Recommendation Function
def recommend(user_input):
    user_input = [i.strip().lower() for i in user_input]

    user_vector = vectorize(user_input)

    similarities = cosine_similarity([user_vector], list(df['vector']))[0]

    df['similarity'] = similarities

    results = df[df['similarity'] > 0.2] \
        .sort_values(by='similarity', ascending=False) \
        .head(5)

    results['similarity'] = results['similarity'] * 100

    # 🆕 ADD THIS (core feature)
    results['missing_ingredients'] = results['ingredients'].apply(
        lambda ing: get_missing_ingredients(user_input, ing)
    )

    return results[['name', 'ingredients', 'missing_ingredients', 'instructions', 'youtube_link', 'similarity']]


if __name__ == "__main__":
    user_input = ["onion", "tomato", "garlic", "salt"]

    results = recommend(user_input)

    print(results[['name', 'missing_ingredients', 'similarity']])