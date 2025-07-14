/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';

interface FormData {
  age: string;
  gender: string;
  caste: string;
  income: string;
  occupation: string;
  disability: string;
  maritalStatus: string;
  religion: string;
  state: string;
  education: string;
  minorityStatus: string;
  forOrphans: string;
}

const SchemeRecommender: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    caste: '',
    income: '',
    occupation: '',
    disability: '',
    maritalStatus: '',
    religion: '',
    state: '',
    education: '',
    minorityStatus: '',
    forOrphans: '',
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const mapIncomeRange = (range: string): number => {
    switch (range) {
      case 'below-27000':
        return 25000;
      case '27000-1lakh':
        return 80000;
      case 'above-1lakh':
        return 200000;
      default:
        return 99999999; // For "null" or blank
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    const payload = {
      age: parseInt(formData.age),
      gender: formData.gender,
      caste: [formData.caste],
      income: mapIncomeRange(formData.income),
      occupation: formData.occupation
        .split(',')
        .map(word => word.trim().toLowerCase())
        .filter(Boolean),
      disability_required: formData.disability,
      marital_status: formData.maritalStatus,
      religion: formData.religion,
      state: formData.state,
      education_required: formData.education,
      minority_status: formData.minorityStatus,
      for_orphans: formData.forOrphans,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/schemes/recommend', payload);
      setRecommendations(response.data.recommendations || []);
    } catch (err: any) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Government Scheme Recommender
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- All your input fields --- */}
          {/* Paste all the input fields from your current form here (unchanged) */}
          {/* --- Paste until the Submit button --- */}

          {/* Age */}
          <div>
            <label className="block mb-2 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-2 font-medium">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Caste */}
          <div>
            <label className="block mb-2 font-medium">Caste Category</label>
            <select name="caste" value={formData.caste} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Caste</option>
              <option value="general">General</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="obc">OBC</option>
            </select>
          </div>

          {/* Income */}
          <div>
            <label className="block mb-2 font-medium">Income</label>
            <select name="income" value={formData.income} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Income Range</option>
              <option value="null">Not Applicable</option>
              <option value="below-27000">Below ₹27,000</option>
              <option value="27000-1lakh">₹27,000–1 Lakh</option>
              <option value="above-1lakh">Above ₹1 Lakh</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block mb-2 font-medium">Occupation (Keywords)</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g., Farmer, FPO, Entrepreneur"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Disability */}
          <div>
            <label className="block mb-2 font-medium">Disability Required</label>
            <select name="disability" value={formData.disability} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block mb-2 font-medium">Marital Status</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Status</option>
              <option value="married">Married</option>
              <option value="unmarried">Unmarried</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>

          {/* Religion */}
          <div>
            <label className="block mb-2 font-medium">Religion</label>
            <select name="religion" value={formData.religion} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Religion</option>
              <option value="hindu">Hindu</option>
              <option value="muslim">Muslim</option>
              <option value="christian">Christian</option>
              <option value="sikh">Sikh</option>
              <option value="buddhist">Buddhist</option>
              <option value="jain">Jain</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block mb-2 font-medium">State/UT</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter State/UT"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block mb-2 font-medium">Education Level Required</label>
            <select name="education" value={formData.education} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Education Level</option>
              <option value="none">None</option>
              <option value="10th-pass">10th Pass</option>
              <option value="12th-pass">12th Pass</option>
              <option value="graduate-plus">Graduate+</option>
            </select>
          </div>

          {/* Minority Status */}
          <div>
            <label className="block mb-2 font-medium">Minority Status</label>
            <select name="minorityStatus" value={formData.minorityStatus} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Orphans */}
          <div>
            <label className="block mb-2 font-medium">For Orphans</label>
            <select name="forOrphans" value={formData.forOrphans} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Scheme Recommendations'}
            </button>
          </div>
        </form>

        {/* Result section */}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {recommendations.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Recommended Schemes:</h2>
            <ul className="space-y-4">
              {recommendations.map((scheme, index) => (
                <li key={index} className="bg-gray-100 rounded-lg p-4 shadow">
                  <h3 className="text-xl font-bold">{scheme['Scheme Name']}</h3>
                  <p className="text-gray-700 mt-2">{scheme['Description']}</p>
                  {scheme['Apply Link'] && (
                    <a
                      href={scheme['Apply Link']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 block"
                    >
                      Apply Here
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeRecommender;
