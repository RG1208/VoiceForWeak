import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, FileText, Shield, Users, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home_title1')}
              <span className="text-blue-200"> {t('home_title2')}</span>
              <br />
              {t('home_title3')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('home_hero_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/voice-assistant"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Mic className="mr-2 h-5 w-5" />
                {t('home_try_voice')}
              </Link>
              <Link
                to="/scheme-recommender"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <FileText className="mr-2 h-5 w-5" />
                {t('home_find_schemes')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home_tools_title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home_tools_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Voice Assistant Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('home_voice_card_title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('home_voice_card_desc')}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-2" />
                  {t('home_voice_card_feat1')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-2" />
                  {t('home_voice_card_feat2')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-2" />
                  {t('home_voice_card_feat3')}
                </li>
              </ul>
              <Link
                to="/voice-assistant"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                {t('home_try_voice')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Scheme Recommender Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-teal-100 p-3 rounded-full mr-4">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('home_scheme_card_title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('home_scheme_card_desc')}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-teal-600 mr-2" />
                  {t('home_scheme_card_feat1')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-teal-600 mr-2" />
                  {t('home_scheme_card_feat2')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <ArrowRight className="h-4 w-4 text-teal-600 mr-2" />
                  {t('home_scheme_card_feat3')}
                </li>
              </ul>
              <Link
                to="/scheme-recommender"
                className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-800 transition-colors"
              >
                {t('home_find_schemes')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('home_mission_title')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('home_mission_desc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-900">{t('home_mission_feat1')}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-teal-600 mr-3" />
                  <span className="font-semibold text-gray-900">{t('home_mission_feat2')}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('home_impact_title')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-gray-600">{t('home_impact_feat1')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-600">100+</div>
                    <div className="text-sm text-gray-600">{t('home_impact_feat2')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">5+</div>
                    <div className="text-sm text-gray-600">{t('home_impact_feat3')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">Free</div>
                    <div className="text-sm text-gray-600">{t('home_impact_feat4')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;