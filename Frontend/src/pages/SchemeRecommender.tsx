import React, { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Integrate with AI Recommendation API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Government Scheme Recommender
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            >
              Get Scheme Recommendations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchemeRecommender;
