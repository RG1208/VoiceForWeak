import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">{t('footer_title')}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer_tagline')}
            </p>
            <p className="text-sm text-gray-500">
              {t('footer_accessible')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2">
              <li><a href="/voice-assistant" className="text-gray-400 hover:text-white transition-colors">{t('footer_voice_assistant')}</a></li>
              <li><a href="/scheme-recommender" className="text-gray-400 hover:text-white transition-colors">{t('footer_scheme_recommender')}</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer_contact_us')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_contact_info')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">support@voiceforweak.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">+91 XXXXXXXXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">{t('footer_available_nationwide')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()}  {t('footer_title')}. {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;