
'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function PageLoader() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        setIsVisible(true);
        setProgress(0);
        
        const timer = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress >= 95) {
                    clearInterval(timer);
                    return 95;
                }
                const diff = Math.random() * 20;
                return Math.min(oldProgress + diff, 95);
            });
        }, 300);

        return () => {
            clearInterval(timer);
        };
    }, []);
    
    useEffect(() => {
        // When navigation completes, fill the bar and hide it.
        setProgress(100);
        const hideTimer = setTimeout(() => setIsVisible(false), 500);
        return () => clearTimeout(hideTimer);
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
             <Progress value={progress} className={cn("h-1 transition-all duration-300 ease-in-out", progress < 100 ? "bg-primary/50" : "bg-primary")}/>
        </div>
    );
}
