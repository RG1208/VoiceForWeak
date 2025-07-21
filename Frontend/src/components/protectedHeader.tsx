import { Heart, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function ProtectedHeader() {
    const [, setUsername] = useState('User');
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setUsername(storedName);
        }
    }, []);

    function handleLogout() {
        if (window.confirm(t('logout_confirm'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            navigate('/');
        }
    }

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="flex items-center space-x-4 group hover:opacity-90 transition">
                                <Heart className="h-8 w-8 text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-800 ">Voice For The Weak</h1>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Language Switcher */}
                            <LanguageSwitcher />
                            {/* Always Visible Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-50 transition"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
