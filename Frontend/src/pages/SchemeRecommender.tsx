import React, { useState } from 'react';
import { Search, User, DollarSign, Briefcase, MapPin, Users, Calendar, Send } from 'lucide-react';

interface FormData {
  name: string;
  age: string;
  gender: string;
  income: string;
  occupation: string;
  state: string;
  category: string;
  disability: string;
  familySize: string;
  hasRationCard: string;
  education: string;
}

interface SchemeRecommendation {
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicationLink: string;
  category: string;
}

const SchemeRecommender: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    income: '',
    occupation: '',
    state: '',
    category: '',
    disability: '',
    familySize: '',
    hasRationCard: '',
    education: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock recommendations based on form data
    const mockRecommendations: SchemeRecommendation[] = [
      {
        name: "Pradhan Mantri Awas Yojana",
        description: "Housing scheme for economically weaker sections to provide affordable housing",
        eligibility: ["Annual income below ₹6 lakh", "No pucca house owned", "First-time home buyer"],
        benefits: "Financial assistance up to ₹2.67 lakh for house construction/purchase",
        applicationLink: "https://pmaymis.gov.in/",
        category: "Housing"
      },
      {
        name: "Ayushman Bharat Scheme",
        description: "National health protection scheme providing health coverage",
        eligibility: ["Family income below ₹5 lakh", "No existing health insurance", "Listed in SECC database"],
        benefits: "Free health coverage up to ₹5 lakh per family per year",
        applicationLink: "https://www.pmjay.gov.in/",
        category: "Healthcare"
      },
      {
        name: "Pradhan Mantri Kisan Samman Nidhi",
        description: "Income support scheme for farmers",
        eligibility: ["Land-holding farmer", "Own cultivable land", "Valid land records"],
        benefits: "₹6,000 per year in three installments",
        applicationLink: "https://www.pmkisan.gov.in/",
        category: "Agriculture"
      },
      {
        name: "National Social Assistance Programme",
        description: "Social security for elderly, widows, and disabled persons",
        eligibility: ["Age above 60 years", "Below poverty line", "No regular income source"],
        benefits: "Monthly pension ranging from ₹200 to ₹500",
        applicationLink: "https://nsap.nic.in/",
        category: "Social Security"
      }
    ];

    setRecommendations(mockRecommendations);
    setIsAnalyzing(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  <option value="bihar">Bihar</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="uttar-pradesh">Uttar Pradesh</option>
                  <option value="west-bengal">West Bengal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="ews">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="illiterate">Illiterate</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="higher-secondary">Higher Secondary</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Post Graduate</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Economic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Annual Income (₹)
                </label>
                <select
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Income Range</option>
                  <option value="below-1lakh">Below ₹1 Lakh</option>
                  <option value="1-2lakh">₹1-2 Lakh</option>
                  <option value="2-3lakh">₹2-3 Lakh</option>
                  <option value="3-5lakh">₹3-5 Lakh</option>
                  <option value="5-8lakh">₹5-8 Lakh</option>
                  <option value="above-8lakh">Above ₹8 Lakh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Occupation
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Occupation</option>
                  <option value="farmer">Farmer</option>
                  <option value="daily-wage">Daily Wage Labor</option>
                  <option value="small-business">Small Business</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="retired">Retired</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Family Size
                </label>
                <select
                  name="familySize"
                  value={formData.familySize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Family Size</option>
                  <option value="1">1 Member</option>
                  <option value="2">2 Members</option>
                  <option value="3">3 Members</option>
                  <option value="4">4 Members</option>
                  <option value="5">5 Members</option>
                  <option value="6+">6+ Members</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ration Card</label>
                <select
                  name="hasRationCard"
                  value={formData.hasRationCard}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Do you have a ration card?</option>
                  <option value="bpl">BPL Card</option>
                  <option value="apl">APL Card</option>
                  <option value="antyodaya">Antyodaya Card</option>
                  <option value="no">No Ration Card</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disability Status</label>
                <select
                  name="disability"
                  value={formData.disability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Disability Status</option>
                  <option value="none">No Disability</option>
                  <option value="physical">Physical Disability</option>
                  <option value="visual">Visual Impairment</option>
                  <option value="hearing">Hearing Impairment</option>
                  <option value="intellectual">Intellectual Disability</option>
                  <option value="multiple">Multiple Disabilities</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Ready to Get Recommendations?</h4>
              <p className="text-sm text-blue-700">
                Based on the information you've provided, our AI will analyze and recommend the most suitable government schemes for you.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Government Scheme Recommender
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your details and discover government welfare schemes you're eligible for. Our AI will provide personalized recommendations.
          </p>
        </div>

        {!recommendations.length ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Steps */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={analyzeAndRecommend}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Get Recommendations'}</span>
                </button>
              )}
            </div>

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="mt-8 bg-teal-50 rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing your profile...
                </h3>
                <p className="text-gray-600">
                  Our AI is matching your details with available government schemes to find the best options for you.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recommendations Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Personalized Scheme Recommendations
              </h2>
              <p className="text-gray-600">
                Based on your profile, here are the government schemes you're eligible for:
              </p>
            </div>

            {/* Recommendations List */}
            {recommendations.map((scheme, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{scheme.name}</h3>
                    <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                      {scheme.category}
                    </span>
                  </div>
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                
                <p className="text-gray-600 mb-4">{scheme.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {scheme.eligibility.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                  <p className="text-sm text-gray-600">{scheme.benefits}</p>
                </div>
                
                <a
                  href={scheme.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <span>Apply Now</span>
                  <Search className="h-4 w-4" />
                </a>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <button
                onClick={() => {
                  setRecommendations([]);
                  setCurrentStep(1);
                  setFormData({
                    name: '', age: '', gender: '', income: '', occupation: '', state: '',
                    category: '', disability: '', familySize: '', hasRationCard: '', education: ''
                  });
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get New Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeRecommender;