import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, ListTodo } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full">
                <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to your Todo List</h1>
                <p className="text-xl text-gray-600 mb-8">Organize your tasks in a simple and efficient way.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <FeatureCard
                        icon={<ListTodo className="w-8 h-8 text-blue-500" />}
                        title="Organize Tasks"
                        description="Create and manage your tasks easily"
                    />
                    <FeatureCard
                        icon={<Clock className="w-8 h-8 text-green-500" />}
                        title="Set Deadlines"
                        description="Establish deadlines for your tasks"
                    />
                    <FeatureCard
                        icon={<CheckCircle className="w-8 h-8 text-purple-500" />}
                        title="Track Progress"
                        description="Visualize and celebrate your achievements"
                    />
                </div>

                <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to={import.meta.env.VITE_LOGIN_SIGN_UP} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                        Get Started
                    </Link>
                </Button>
            </div>
        </div>
    )
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex justify-center mb-2">{icon}</div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    )
}

export default LandingPage