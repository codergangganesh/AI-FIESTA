'use client'

import ModernHistoryInterface from '@/components/history/ModernHistoryInterface'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useOptimizedRouter } from '@/hooks/useOptimizedRouter'
import SimpleLoader from '@/components/ui/SimpleLoader'
import { useOptimizedLoading } from '@/contexts/OptimizedLoadingContext'

export default function HistoryPage() {
    const { user, loading } = useAuth()
    const router = useOptimizedRouter()
    const { setPageLoading } = useOptimizedLoading()

    // Redirect unauthenticated users to the auth page
    useEffect(() => {
        if (!loading && !user) {
            setPageLoading(true, "Redirecting to authentication...");
            router.push('/auth')
        } else if (user && !loading) {
            setPageLoading(false);
        }
    }, [user, loading, router, setPageLoading])

    // Show loading while checking auth status
    if (loading) {
        return <SimpleLoader message="Loading history..." />;
    }

    // Show nothing while redirecting
    if (!user) {
        return null;
    }

    return (
        <div className="h-screen">
            <ModernHistoryInterface />
        </div>
    )
}
