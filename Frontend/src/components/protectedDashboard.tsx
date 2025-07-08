import {
    Award,
    Mic,
    CheckCircle,
    Clock,
    AlertCircle,
    Globe,
    Scale,
    Heart
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {

    const [username, setUsername] = useState('User');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setUsername(storedName);
        }
    }, []);

    const recentActivity = [
        {
            id: 1,
            title: 'Voice Analysis Completed',
            description: 'Workplace harassment case analyzed - IPC 354A applicable',
            status: 'completed',
            time: '2 hours ago'
        },
        {
            id: 2,
            title: 'Scheme Eligibility Updated',
            description: 'Found 3 new schemes you qualify for',
            status: 'new',
            time: '4 hours ago'
        },
        {
            id: 3,
            title: 'Legal Rights Summary',
            description: 'Property dispute analysis completed',
            status: 'completed',
            time: '1 day ago'
        },
    ];

    const features = [
        {
            icon: Mic,
            title: 'Voice Analysis',
            description: 'Speak in your local language about any legal issue. Our AI analyzes your case and identifies applicable laws.',
            color: 'bg-blue-500'
        },
        {
            icon: Award,
            title: 'Government Schemes',
            description: 'Get personalized recommendations for central and state government schemes you are eligible for.',
            color: 'bg-purple-500'
        },
        {
            icon: Scale,
            title: 'Legal Rights',
            description: 'Understand your legal rights and the IPC sections that apply to your specific situation.',
            color: 'bg-green-500'
        }
    ];
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back,{username}!</h2>
                        <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            <Globe className="h-4 w-4" />
                            <span>6 Languages Supported</span>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600">Your AI-powered legal companion is ready to help you understand your rights and find government schemes.</p>
                </div>

                {/* Main Features Section */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">How We Help You</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-all duration-300 border border-gray-100 group">
                                <div className={`${feature.color} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-200`}>
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                            <span className="text-sm text-gray-500">Last 7 days</span>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className={`p-2 rounded-lg ${activity.status === 'completed' ? 'bg-green-100' :
                                        activity.status === 'new' ? 'bg-blue-100' : 'bg-yellow-100'
                                        }`}>
                                        {activity.status === 'completed' ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : activity.status === 'new' ? (
                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                        <span className="text-xs text-gray-500">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/voice-assistant')}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm">
                                <Mic className="h-5 w-5" />
                                <span>Start Voice Analysis</span>
                            </button>

                            <button
                                onClick={() => navigate('/scheme-recommender')}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                            >
                                <Award className="h-5 w-5" />
                                <span>Check Schemes</span>
                            </button>

                            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm">
                                <Scale className="h-5 w-5" />
                                <span>Know Your Rights</span>
                            </button>
                        </div>

                        {/* Support Section */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                <h4 className="font-medium text-gray-900">Need Help?</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Our support team is here to assist you with any questions.</p>
                            <button className="text-sm bg-white text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg font-medium transition-colors border border-orange-200">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="text-center max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Empowering Justice for Everyone</h3>
                        <p className="text-lg opacity-90 leading-relaxed">
                            Voice for the Weak bridges the gap between complex legal systems and everyday people.
                            Our AI-powered platform makes legal knowledge accessible in your local language,
                            helping you understand your rights and access government benefits you deserve.
                        </p>
                        <div className="flex items-center justify-center space-x-8 mt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">5+</div>
                                <div className="text-sm opacity-80">Languages</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-sm opacity-80">IPC Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">1300+</div>
                                <div className="text-sm opacity-80">Govt Schemes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;