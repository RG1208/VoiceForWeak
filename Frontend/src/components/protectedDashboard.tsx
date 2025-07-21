import {
    Award,
    Mic,
    CheckCircle,
    Clock,
    AlertCircle,
    Scale,
    Heart,
    Shield,
    ArrowRight,
    Sparkles,
    Users,
    TrendingUp
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

    const services = [
        {
            icon: Mic,
            title: 'IPC Analysis',
            description: 'Speak about your legal issue and get instant analysis with applicable IPC sections',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'from-blue-600 to-blue-700',
            route: '/ipc-assistant',
            badge: '98% accuracy'
        },
        {
            icon: Shield,
            title: 'BNS Analysis',
            description: 'Get comprehensive analysis under the new Bharatiya Nyaya Sanhita',
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'from-purple-600 to-purple-700',
            route: '/bns-assistant',
            badge: '98% accuracy'
        },
        {
            icon: Award,
            title: 'Government Schemes',
            description: 'Discover personalized government schemes and benefits you qualify for',
            color: 'from-emerald-500 to-emerald-600',
            hoverColor: 'from-emerald-600 to-emerald-700',
            route: '/scheme-recommender',
            badge: '1300+ Schemes'
        },
        {
            icon: Scale,
            title: 'Legal Rights',
            description: 'Understand your fundamental rights and legal protections',
            color: 'from-orange-500 to-orange-600',
            hoverColor: 'from-orange-600 to-orange-700',
            route: '/legal-rights',
            badge: 'Know Your Rights'
        }
    ];

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-4">
                                <Sparkles className="h-8 w-8 text-yellow-300" />
                                <h2 className="text-3xl font-bold">Welcome back, {username}!</h2>
                            </div>
                            <p className="text-xl opacity-90 mb-6">
                                Your AI-powered legal companion is ready to help you navigate complex legal matters with ease.
                            </p>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-blue-200" />
                                    <span className="text-sm">25,000+ Users Helped</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-green-200" />
                                    <span className="text-sm">94% Success Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Services Section */}
                <div className="mb-8">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-slate-800 mb-3">Our Legal Services</h3>
                        <p className="text-lg text-slate-600">Choose the service that best fits your legal needs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-200 group cursor-pointer"
                                onClick={() => navigate(service.route)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`bg-gradient-to-r ${service.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                                        <service.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                                        {service.badge}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {service.title}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">{service.description}</p>
                                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    <span>Get Started</span>
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity & Support */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-slate-800">Recent Activity</h3>
                            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 7 days</span>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors">
                                    <div className={`p-2 rounded-lg ${activity.status === 'completed' ? 'bg-emerald-100' :
                                        activity.status === 'new' ? 'bg-blue-100' : 'bg-amber-100'
                                        }`}>
                                        {activity.status === 'completed' ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        ) : activity.status === 'new' ? (
                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-800 mb-1">{activity.title}</h4>
                                        <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
                                        <span className="text-xs text-slate-500">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6">Need Assistance?</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <h4 className="font-medium text-slate-800">Expert Support</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">Get help from our legal experts anytime</p>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                    Contact Support
                                </button>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                <h4 className="font-medium text-slate-800 mb-2">Quick Stats</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Cases Analyzed</span>
                                        <span className="font-semibold text-emerald-600">1,247</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Success Rate</span>
                                        <span className="font-semibold text-emerald-600">94.2%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Avg Response</span>
                                        <span className="font-semibold text-emerald-600">&lt;2 min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Mission */}
                <div className="mt-12 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 text-white">
                    <div className="text-center max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Democratizing Legal Knowledge</h3>
                        <p className="text-lg opacity-90 leading-relaxed mb-8">
                            We're on a mission to make legal expertise accessible to everyone. Our AI-powered platform
                            breaks down complex legal barriers, providing instant, accurate legal guidance in your preferred language.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">6</div>
                                <div className="text-sm opacity-80">Languages</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">500+</div>
                                <div className="text-sm opacity-80">IPC Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">350+</div>
                                <div className="text-sm opacity-80">BNS Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-400">1300+</div>
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