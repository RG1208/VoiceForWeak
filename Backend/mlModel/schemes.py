# schemes_recommender.py

import pandas as pd #type:ignore
from sentence_transformers import SentenceTransformer, util #type:ignore
import os

# ----------------------------
# Load and preprocess the dataset
# ----------------------------
csv_path = os.path.join(os.path.dirname(__file__), 'data', 'Schemes.csv')
df = pd.read_csv(csv_path)
df.fillna('any', inplace=True)

columns_to_lower = ['Gender', 'Caste', 'Income Max (Annual)', 'Occupation', 'Disability Required',
                    'Marital status', 'Religion', 'state', 'Education Required', 'Minority status', 'For Orphans']
for col in columns_to_lower:
    df[col] = df[col].astype(str).str.lower()

# ----------------------------
# Clean income column (e.g., '₹2.5 lakh' => 250000)
# ----------------------------
def clean_income(income_str):
    income_str = str(income_str).replace("lakh", "00000").replace("lakhs", "00000").replace("₹", "")
    digits = ''.join(filter(str.isdigit, income_str))
    return int(digits) if digits else None

# ----------------------------
# Create full semantic text for each row
# ----------------------------
def enrich_text(row):
    return (
        f"Represent this scheme for retrieval: {row['Description']} "
        f"Eligibility: Gender: {row['Gender']}, "
        f"Caste: {row['Caste']}, Income: {row['Income Max (Annual)']}, "
        f"Occupation: {row['Occupation']}, Disability: {row['Disability Required']}, "
        f"Marital Status: {row['Marital status']}, Religion: {row['Religion']}, "
        f"State: {row['state']}, Education: {row['Education Required']}, "
        f"Minority: {row['Minority status']}, For Orphans: {row['For Orphans']}."
    )

df['full_text'] = df.apply(enrich_text, axis=1)

# ----------------------------
# Load the semantic model and encode all schemes
# ----------------------------
model = SentenceTransformer('BAAI/bge-base-en-v1.5')
scheme_embeddings = model.encode(df['full_text'].tolist(), convert_to_tensor=True)

# ----------------------------
# Eligibility check function
# ----------------------------
def is_eligible(row, user_profile):
    try:
        if str(row['Min Age']).lower() not in ['none', 'any'] and int(user_profile['age']) < int(row['Min Age']):
            return False
        if str(row['Max Age']).lower() not in ['none', 'any'] and int(user_profile['age']) > int(row['Max Age']):
            return False
    except:
        pass

    if row['Gender'] != 'any' and row['Gender'] != user_profile['gender'].lower():
        return False
    if row['Caste'] != 'any' and row['Caste'] != user_profile['caste'].lower():
        return False

    scheme_income = clean_income(row['Income Max (Annual)'])
    if scheme_income is not None and user_profile['income'] > scheme_income:
        return False

    if row['Occupation'] != 'any' and row['Occupation'] != 'none':
        user_occupations = user_profile['occupation']
        if isinstance(user_occupations, list):
            if not any(occ.lower() in row['Occupation'] for occ in user_occupations):
                return False
        else:
            if user_occupations.lower() not in row['Occupation']:
                return False

    if row['state'] not in ['any', 'central']:
        if row['state'] != user_profile['state'].lower():
            return False

    return True

# ----------------------------
# Recommend top N schemes
# ----------------------------
def recommend_schemes(user_query, user_profile, top_k=5):
    user_context = (
        f"gender: {user_profile['gender']}, caste: {user_profile['caste']}, "
        f"income: {user_profile['income']}, occupation: {user_profile['occupation']}, "
        f"state: {user_profile['state']}, age: {user_profile['age']}"
    )

    if not user_query or user_query.strip() == "":
        user_query = (
            f"I am a {user_profile['age']}-year-old {user_profile['gender']} from {user_profile['state']}, "
            f"belonging to the {user_profile['caste']} caste, working as a {user_profile['occupation']}. "
            f"My annual income is ₹{user_profile['income']}."
        )

    query_text = f"Represent this government benefit query for retrieval: {user_query.strip()} Context: {user_context.strip()}"
    query_embedding = model.encode(query_text, convert_to_tensor=True)

    scores = util.cos_sim(query_embedding, scheme_embeddings)[0]
    sorted_scores_indices = sorted(zip(scores.tolist(), range(len(scores))), reverse=True)

    recommendations = []
    count = 0

    for score, idx in sorted_scores_indices:
        row = df.iloc[idx]
        if is_eligible(row, user_profile):
            recommendations.append({
                'Scheme Name': row['Scheme Name'],
                'Category': row['Category'],
                'Description': row['Description'],
                'Apply Link': row['Apply Link'],
                'Similarity Score': round(score, 4)
            })
            count += 1
            if count >= top_k:
                break

    return recommendations

# ----------------------------
# Example usage
# ----------------------------
if __name__ == "__main__":
    user_profile = {
        'gender': 'female',
        'caste': 'sc',
        'income': 150000,
        'occupation': 'student',
        'state': 'delhi',
        'age': 19
    }

    results = recommend_schemes("", user_profile, top_k=5)
    for r in results:
        print(r)
