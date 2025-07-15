import pandas as pd # type: ignore
from sentence_transformers import SentenceTransformer, util #type:ignore
import os

# Load dataset
def load_data(file_path=None):
    if file_path is None:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, 'data', 'Schemes.csv')  # Path relative to schemes.py
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
        df.fillna('any', inplace=True)
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding='latin1')
        df.fillna('any', inplace=True)

    # Standardize relevant columns
    for col in ['Gender', 'Caste', 'Income Max (Annual)', 'Occupation', 'Disability Required',
                'Marital status', 'Religion', 'state', 'Education Required', 'Minority status', 'For Orphans']:
        df[col] = df[col].astype(str).str.lower()

    # Combine description and eligibility summary for semantic embedding
    df['full_text'] = df['Description'] + " " + df['Eligibility Summary']
    return df

# Load model and generate embeddings
def generate_embeddings(df):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(df['full_text'].tolist(), convert_to_tensor=True)
    return model, embeddings

# Eligibility check

def is_eligible(row, user_profile):
    try:
        min_age = row['Min Age']
        max_age = row['Max Age']
        user_age = user_profile.get('age')
        if min_age != 'none' and min_age != 'any' and int(user_age) < int(min_age):
            return False
        if max_age != 'none' and max_age != 'any' and int(user_age) > int(max_age):
            return False
    except:
        pass

    if row['Gender'] != 'any' and row['Gender'] != user_profile.get('gender', '').lower():
        return False
    if row['Caste'] != 'any' and row['Caste'] != user_profile.get('caste', '').lower():
        return False

    income_max = row['Income Max (Annual)']
    user_income = user_profile.get('income', 0)
    if income_max != 'any' and income_max != 'none':
        try:
            income_limit = int(''.join(filter(str.isdigit, income_max)))
            if user_income > income_limit:
                return False
        except:
            pass

    if row['Occupation'] != 'any' and row['Occupation'] != 'none':
        user_occupations = user_profile.get('occupation', [])
        if isinstance(user_occupations, str):
            user_occupations = [user_occupations.lower()]
        else:
            user_occupations = [str(o).lower() for o in user_occupations]
        row_occupation = str(row['Occupation']).lower()
        if not any(occ in row_occupation for occ in user_occupations):
            return False

    if row['state'] != 'any' and row['state'] != user_profile.get('state', '').lower():
        return False

    return True

# Recommendation function
def recommend_schemes(df, model, embeddings, user_query, user_profile, top_k=5):
    query_embedding = model.encode(user_query, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, embeddings)[0]
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
