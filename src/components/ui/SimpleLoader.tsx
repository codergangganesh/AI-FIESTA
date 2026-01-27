import { Loader2 } from 'lucide-react'

interface SimpleLoaderProps {
    message?: string
}

export default function SimpleLoader({ message = 'Loading...' }: SimpleLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="flex flex-col items-center p-8 rounded-2xl">
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    )
}
