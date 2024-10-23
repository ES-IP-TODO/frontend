import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundError: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                <FileQuestion className="w-24 h-24 text-blue-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Oops! It looks like you got lost. The page you are looking for does not exist or has been moved.
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link
                        to="/"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Back to Home Page
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default NotFoundError