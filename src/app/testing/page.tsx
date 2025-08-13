
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Network, Database, KeyRound, ShieldQuestion, FileText, FileJson, Code, BookCopy, PlayCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';

type Component = {
    id: string;
    name: string;
    icon: React.ReactNode;
};

type WorkflowPhase = {
    id: 'authorize' | 'authenticate' | 'accounting' | 'post-auth';
    name: string;
    components: Component[];
};

type Workflows = {
    [key: string]: WorkflowPhase[];
}

// Sample workflows data - in a real app this would come from a shared service or API
const initialWorkflows: Workflows = {
    'Default': [
        { id: 'authorize', name: 'Authorize', components: [{ id: 'sql-1', name: 'SQL', icon: <FileJson className="size-4" /> }] },
        { id: 'authenticate', name: 'Authenticate', components: [{ id: 'pap-1', name: 'PAP', icon: <FileText className="size-4" /> }] },
        { id: 'accounting', name: 'Accounting', components: [{ id: 'acct-logs-1', name: 'Acct Logs', icon: <FileText className="size-4" /> }] },
        { id: 'post-auth', name: 'Post-Auth', components: [{ id: 'rate-limit-1', name: 'Rate Limit', icon: <Code className="size-4" /> }] },
    ],
    'Guest-Wifi': [
         { id: 'authorize', name: 'Authorize', components: [] },
        { id: 'authenticate', name: 'Authenticate', components: [{ id: 'mschap-1', name: 'MS-CHAP', icon: <FileText className="size-4" /> }] },
        { id: 'accounting', name: 'Accounting', components: [{ id: 'syslog-1', name: 'Syslog', icon: <FileJson className="size-4" /> }] },
        { id: 'post-auth', name: 'Post-Auth', components: [] },
    ],
    'VPN-Users': [
        { id: 'authorize', name: 'Authorize', components: [{ id: 'ldap-1', name: 'LDAP', icon: <FileJson className="size-4" /> }] },
        { id: 'authenticate', name: 'Authenticate', components: [{ id: 'eap-tls-1', name: 'EAP-TLS', icon: <FileText className="size-4" /> }] },
        { id: 'accounting', name: 'Accounting', components: [{ id: 'sql-2', name: 'SQL', icon: <FileJson className="size-4" /> }, { id: 'acct-logs-2', name: 'Acct Logs', icon: <FileText className="size-4" /> } ] },
        { id: 'post-auth', name: 'Post-Auth', components: [] },
    ],
};

type TestStatus = 'idle' | 'running' | 'success' | 'failed';
type ComponentStatus = { [componentId: string]: 'pending' | 'running' | 'success' | 'failed' };

export default function TestingPage() {
    const [workflows, setWorkflows] = useState<Workflows>(initialWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState('Default');
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [componentStatus, setComponentStatus] = useState<ComponentStatus>({});
    const [errorComponent, setErrorComponent] = useState<string | null>(null);

    const currentWorkflow = workflows[selectedWorkflow] || [];

    const resetTestState = () => {
        setTestStatus('idle');
        setComponentStatus({});
        setErrorComponent(null);
    }
    
    useEffect(() => {
        resetTestState();
    }, [selectedWorkflow]);

    const runTest = async () => {
        resetTestState();
        setTestStatus('running');

        const allComponents: { phaseId: string; component: Component }[] = [];
        currentWorkflow.forEach(phase => {
            phase.components.forEach(component => {
                allComponents.push({ phaseId: phase.id, component });
            });
        });

        if(allComponents.length === 0) {
            setTestStatus('success');
            return;
        }

        let failed = false;

        for (let i = 0; i < allComponents.length; i++) {
            const { component } = allComponents[i];
            
            setComponentStatus(prev => ({ ...prev, [component.id]: 'running' }));

            await new Promise(resolve => setTimeout(resolve, 750));
            
            // Simulate a random failure for demonstration
            const shouldFail = Math.random() < 0.15 && i > 0;
            
            if (shouldFail) {
                failed = true;
                setComponentStatus(prev => ({ ...prev, [component.id]: 'failed' }));
                setErrorComponent(component.id);
                setTestStatus('failed');
                break;
            } else {
                 setComponentStatus(prev => ({ ...prev, [component.id]: 'success' }));
            }
        }
        
        if (!failed) {
            setTestStatus('success');
        }
    };
    
    const getStatusIcon = () => {
        switch (testStatus) {
            case 'running':
                return <Loader className="size-5 animate-spin" />;
            case 'success':
                return <CheckCircle className="size-5 text-green-500" />;
            case 'failed':
                return <XCircle className="size-5 text-destructive" />;
            default:
                return <PlayCircle className="size-5" />;
        }
    }

    const getComponentBorder = (componentId: string) => {
        switch (componentStatus[componentId]) {
            case 'running':
                return 'border-blue-500 ring-2 ring-blue-500/50';
            case 'success':
                return 'border-green-500';
            case 'failed':
                return 'border-destructive ring-2 ring-destructive/50';
            default:
                return 'border-border';
        }
    };

    return (
        <div className="grid h-full min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="lg:col-span-1">
                <Card className="glass-card sticky top-24">
                    <CardHeader>
                        <CardTitle>Test Packet</CardTitle>
                        <CardDescription>Configure and send a sample RADIUS packet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="workflow-select">Workflow</Label>
                            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                                <SelectTrigger id="workflow-select">
                                    <SelectValue placeholder="Select a workflow" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(workflows).map(wf => (
                                        <SelectItem key={wf} value={wf}>{wf}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="e.g. testuser" defaultValue="testuser"/>
                        </div>
                        <div>
                            <Label htmlFor="attributes">RADIUS Attributes</Label>
                            <Input id="attributes" placeholder="e.g. Framed-IP-Address=1.2.3.4" />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={runTest} disabled={testStatus === 'running'} className="w-full">
                            {getStatusIcon()}
                            <span className="ml-2">
                                {testStatus === 'running' ? 'Running Test...' : 'Run Test'}
                            </span>
                        </Button>
                    </CardFooter>
                </Card>
            </aside>
            <main className="lg:col-span-2">
                 <Card className="glass-card min-h-[500px]">
                    <CardHeader>
                        <CardTitle>Workflow Visualization</CardTitle>
                        <CardDescription>Observe the packet flow through the selected workflow in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentWorkflow.map(phase => (
                            <div key={phase.id}>
                                <h3 className="font-semibold text-lg mb-2">{phase.name}</h3>
                                <div className={cn("p-4 border-2 border-dashed rounded-lg min-h-[80px] transition-colors flex flex-col gap-2", 
                                    testStatus === 'running' ? 'border-accent/80' : 'border-border/50'
                                    )}>
                                    {phase.components.length === 0 ? (
                                        <div className="flex items-center justify-center text-muted-foreground h-full py-4">
                                            <p>No components in this phase</p>
                                        </div>
                                    ) : (
                                        phase.components.map(component => (
                                            <div key={component.id} className={cn(
                                                "flex items-center gap-3 rounded-lg border p-3 bg-card/80 shadow-sm transition-all",
                                                getComponentBorder(component.id)
                                                )}>
                                                {component.icon}
                                                <span className="flex-1 text-sm font-medium">{component.name}</span>
                                                {componentStatus[component.id] === 'running' && <Loader className="size-4 animate-spin text-blue-500" />}
                                                {componentStatus[component.id] === 'success' && <CheckCircle className="size-4 text-green-500" />}
                                                {componentStatus[component.id] === 'failed' && <XCircle className="size-4 text-destructive" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                                {phase.id !== 'post-auth' && <Separator className="my-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

