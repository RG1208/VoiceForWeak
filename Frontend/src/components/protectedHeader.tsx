import { useEffect, useState } from 'react';
import { Heart, Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedHeader() {
    const [username, setUsername] = useState('User');
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setUsername(storedName);
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        navigate('/');
    }
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-3">
                        <Heart className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Voice for the Weak</h1>
                            <p className="text-sm text-gray-600">Empowering Justice Through AI</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your cases..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors">
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">{username}</span>
                        </button>
                        <button
                            onClick={() => {
                                handleLogout();
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
}
