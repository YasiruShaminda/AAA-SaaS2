
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Server, Smartphone, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Profile } from '@/app/projects/page';

const AttributeBox = ({ title, attributes, titleClassName }: { title: string, attributes: string[], titleClassName?: string }) => (
    <div className="w-full">
        <h3 className={`text-center font-semibold mb-2 ${titleClassName}`}>{title}</h3>
        <Card className="bg-background/50 border-dashed min-h-24">
            <CardContent className="p-2 space-x-1 space-y-1">
                {attributes.length > 0 ? attributes.map(attr => (
                    <Badge variant="secondary" key={attr}>{attr}</Badge>
                )) : <p className="text-xs text-muted-foreground text-center pt-2">No attributes defined</p>}
            </CardContent>
        </Card>
    </div>
);


export function PreviewAnimation({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void, profile: Profile }) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>AAA Flow Preview</DialogTitle>
                    <DialogDescription>
                        A visual representation of the RADIUS authentication flow based on your project configuration.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="bg-muted/30 rounded-lg p-8 space-y-8">
                     {/* Flow visual */}
                    <div className="flex items-center justify-between">
                        {/* NAS */}
                        <div className="flex flex-col items-center gap-2 text-center w-32 z-10">
                            <Smartphone className="size-10"/>
                            <span className="font-semibold">Your NAS</span>
                        </div>

                        {/* Arrows */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-8 mx-4">
                           {/* Request Arrow */}
                           <div className="w-full flex flex-col items-center">
                                <p className="text-sm font-medium mb-1">Access-Request</p>
                                <div className="w-full h-1 bg-primary relative">
                                    <ArrowRight className="absolute -right-1 -top-2 size-5 text-primary" />
                                </div>
                           </div>
                           {/* Reply Arrow */}
                            <div className="w-full flex flex-col items-center">
                                <p className="text-sm font-medium text-green-400 mb-1">Access-Accept</p>
                                <div className="w-full h-1 bg-green-400 relative">
                                    <ArrowLeft className="absolute -left-1 -top-2 size-5 text-green-400" />
                                </div>
                           </div>
                        </div>

                        {/* AAA Server */}
                        <div className="flex flex-col items-center gap-2 text-center w-32 z-10">
                            <Server className="size-10 text-primary" />
                            <span className="font-semibold">Monyfi AAA</span>
                        </div>
                    </div>
                    
                    {/* Attributes */}
                    <div className="flex items-start justify-between gap-8">
                        <AttributeBox title="Auth Request Attributes" attributes={profile.checkAttributes} />
                        <AttributeBox title="Auth Reply Attributes" attributes={profile.replyAttributes} titleClassName="text-green-400" />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
