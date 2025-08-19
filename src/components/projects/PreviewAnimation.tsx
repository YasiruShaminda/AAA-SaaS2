
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Server, Smartphone, KeyRound, UserCheck, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Profile } from '@/app/projects/page';

type Stage = 'idle' | 'request_sent' | 'processing_auth' | 'processing_acct' | 'response_sent' | 'complete';
type Status = 'pending' | 'success' | 'failed' | 'skipped';

const processingStages: { id: Stage; name: string; icon: React.ReactNode }[] = [
    { id: 'processing_auth', name: 'Authorize & Authenticate', icon: <UserCheck /> },
];

export function PreviewAnimation({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void, profile: Profile }) {
    const [currentStage, setCurrentStage] = useState<Stage>('idle');
    const [statuses, setStatuses] = useState<Record<Stage, Status>>({
        idle: 'pending',
        request_sent: 'pending',
        processing_auth: 'pending',
        processing_acct: 'pending',
        response_sent: 'pending',
        complete: 'pending',
    });

    useEffect(() => {
        if (open) {
            resetAnimation();
            startAnimation();
        }
    }, [open, profile]);
    
    const resetAnimation = () => {
        setCurrentStage('idle');
        setStatuses({
            idle: 'pending',
            request_sent: 'pending',
            processing_auth: 'pending',
            processing_acct: 'pending',
            response_sent: 'pending',
            complete: 'pending',
        });
    }

    const startAnimation = async () => {
        // 1. Request sent from NAS
        setCurrentStage('request_sent');
        await new Promise(r => setTimeout(r, 1200));
        
        // 2. AAA Server processing
        setCurrentStage('processing_auth');
        setStatuses(s => ({ ...s, processing_auth: 'success' }));
        await new Promise(r => setTimeout(r, 1200));
        
        // 3. Response sent from AAA
        setCurrentStage('response_sent');
        await new Promise(r => setTimeout(r, 1200));

        // 4. Complete
        setCurrentStage('complete');
        setStatuses(s => ({ ...s, complete: 'success' }));
    };

    const RequestPacket = () => (
        <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 'calc(50vw - 200px)', transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute top-1/2 -translate-y-1/2"
        >
            <Card className="p-2 w-48 bg-background/90 backdrop-blur-md">
                <CardHeader className="p-1"><CardTitle className="text-sm">Access-Request</CardTitle></CardHeader>
                <CardContent className="p-1">
                    <ScrollArea className="h-24">
                        <div className="space-y-1 text-left">
                            {profile.checkAttributes.map(attr => <Badge variant="secondary" key={attr}>{attr}</Badge>)}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    );
    
    const ResponsePacket = () => (
        <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: '-calc(50vw - 200px)', transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute top-1/2 -translate-y-1/2"
        >
            <Card className="p-2 w-48 border-green-500/50 bg-background/90 backdrop-blur-md">
                <CardHeader className="p-1"><CardTitle className="text-sm text-green-400">Access-Accept</CardTitle></CardHeader>
                <CardContent className="p-1">
                    <ScrollArea className="h-24">
                        <div className="space-y-1 text-left">
                            {profile.replyAttributes.map(attr => <Badge variant="secondary" key={attr}>{attr}</Badge>)}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>AAA Flow Preview</DialogTitle>
                    <DialogDescription>
                        A visual representation of the RADIUS authentication flow based on your project configuration.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between items-center p-8 bg-muted/30 rounded-lg overflow-hidden h-[350px] relative">
                    
                    {/* NAS */}
                    <div className="flex flex-col items-center gap-2 text-center w-32 z-10">
                        <Smartphone className={cn("size-10", currentStage === 'complete' && 'text-green-500')}/>
                        <span className="font-semibold">NAS</span>
                    </div>

                    {/* Packet Flow Area */}
                    <div className="absolute inset-x-32 h-full">
                        <AnimatePresence>
                             {currentStage === 'request_sent' && <RequestPacket />}
                             {currentStage === 'response_sent' && <ResponsePacket />}
                        </AnimatePresence>
                        <div className="absolute w-full border-t-2 border-dashed top-1/2 -translate-y-1/2"></div>
                    </div>

                    {/* AAA Server */}
                     <div className="flex flex-col items-center gap-2 text-center w-32 z-10">
                        <Server className={cn("size-10", currentStage !== 'idle' && 'text-primary')} />
                        <span className="font-semibold">AAA Server</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-center">
                    {processingStages.map(stage => (
                        <div key={stage.id} className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            currentStage === stage.id ? "border-primary bg-primary/10" : "border-transparent bg-muted/40",
                            statuses[stage.id] === 'success' && "border-green-500/50 bg-green-500/10"
                        )}>
                            <div className="flex items-center justify-center gap-2">
                                {statuses[stage.id] === 'success' ? <CheckCircle className="text-green-500" /> : stage.icon}
                                <h4 className="font-semibold">{stage.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={startAnimation} disabled={currentStage !== 'idle' && currentStage !== 'complete'}>
                        <ArrowRight className="mr-2" />
                        Replay
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
