

'use client';

import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Network, Database, KeyRound, ShieldQuestion, FileText, FileJson, Trash2, GripVertical, Waypoints, Code, BookCopy, PlusCircle, Copy, GitBranch, Terminal, Ban, CheckCircle, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Component = {
    id: string;
    name: string;
    type: 'if-else' | 'component';
    condition?: string;
    if?: Component[];
    else?: Component[];
};

type LibraryComponent = Omit<Component, 'id'>;

type ComponentCategory = {
    title: string;
    icon: React.ReactNode;
    components: LibraryComponent[];
};

type WorkflowPhase = {
    id: 'authorize' | 'authenticate' | 'accounting' | 'post-auth';
    name: string;
    components: Component[];
};

type Workflows = {
    [key: string]: WorkflowPhase[];
}

type DraggedItem = {
    component: LibraryComponent | Component;
    sourcePath?: string; // Path of the component if it's being moved from within the workflow
};

const getComponentIcon = (name: string): React.ReactNode => {
    switch (name) {
        case 'PAP':
        case 'CHAP':
        case 'MS-CHAP':
        case 'EAP-TLS':
        case 'Packet Logs':
        case 'Auth Logs':
        case 'Acct Logs':
            return <FileText className="size-4" />;
        case 'Daily Quota':
        case 'Session Time Limit':
        case 'Rate Limit':
            return <Code className="size-4" />;
        case 'SQL':
        case 'LDAP':
        case 'REST API':
        case 'Syslog':
            return <FileJson className="size-4" />;
        case 'If / Else':
            return <GitBranch className="size-4" />;
        case 'Accept':
            return <CheckCircle className="size-4 text-green-500" />;
        case 'Reject':
            return <Ban className="size-4 text-red-500" />;
        case 'Break':
            return <LogOut className="size-4" />;
        default:
            return <Waypoints className="size-4" />;
    }
}


const componentLibrary: ComponentCategory[] = [
    {
        title: 'Authentication',
        icon: <KeyRound className="size-5 text-primary" />,
        components: [
            { name: 'PAP', type: 'component' },
            { name: 'CHAP', type: 'component' },
            { name: 'MS-CHAP', type: 'component' },
            { name: 'EAP-TLS', type: 'component' },
        ]
    },
    {
        title: 'Modules',
        icon: <ShieldQuestion className="size-5 text-green-400" />,
        components: [
            { name: 'Daily Quota', type: 'component' },
            { name: 'Session Time Limit', type: 'component' },
            { name: 'Rate Limit', type: 'component' },
        ]
    },
    {
        title: 'Databases',
        icon: <Database className="size-5 text-yellow-400" />,
        components: [
            { name: 'SQL', type: 'component' },
            { name: 'LDAP', type: 'component' },
            { name: 'REST API', type: 'component' },
        ]
    },
    {
        title: 'Logging',
        icon: <BookCopy className="size-5 text-blue-400" />,
        components: [
            { name: 'Packet Logs', type: 'component' },
            { name: 'Auth Logs', type: 'component' },
            { name: 'Acct Logs', type: 'component' },
            { name: 'Syslog', type: 'component' },
        ]
    },
    {
        title: 'Logic',
        icon: <GitBranch className="size-5 text-indigo-400" />,
        components: [
            { name: 'If / Else', type: 'if-else' },
        ]
    },
    {
        title: 'Flow Control',
        icon: <Terminal className="size-5 text-red-400" />,
        components: [
            { name: 'Accept', type: 'component' },
            { name: 'Reject', type: 'component' },
            { name: 'Break', type: 'component' },
        ]
    }
];

const emptyWorkflow: WorkflowPhase[] = [
    { id: 'authorize', name: 'Authorize', components: [] },
    { id: 'authenticate', name: 'Authenticate', components: [] },
    { id: 'accounting', name: 'Accounting', components: [] },
    { id: 'post-auth', name: 'Post-Auth', components: [] },
];

const DraggableComponent = ({ component, onDragStart }: { component: LibraryComponent, onDragStart: (e: DragEvent<HTMLDivElement>, component: LibraryComponent) => void }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, component)}
        className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md hover:border-accent cursor-grab active:cursor-grabbing bg-card/80"
    >
        {getComponentIcon(component.name)}
        <span className="text-sm font-medium">{component.name}</span>
    </div>
);

const DropZone = ({ onDrop, onDragOver, onDragEnter, onDragLeave, children, isEmpty, onDragEnd }: { onDrop: (e: DragEvent<HTMLDivElement>) => void, onDragOver: (e: DragEvent<HTMLDivElement>) => void, onDragEnter: (e: DragEvent<HTMLDivElement>) => void, onDragLeave: (e: DragEvent<HTMLDivElement>) => void, children: React.ReactNode, isEmpty: boolean, onDragEnd: () => void }) => (
    <div
        className={cn(
            "p-4 border-2 border-dashed rounded-lg min-h-[100px] transition-colors relative",
            isEmpty ? "flex items-center justify-center text-muted-foreground" : "space-y-2"
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragEnd={onDragEnd}
    >
        {isEmpty ? <p>Drag components here</p> : children}
    </div>
);

const WorkflowComponent = ({ component, path, handleDrop, handleRemoveComponent, handleConditionChange, handleComponentDragStart, handleDragOver, handleDragEnd, dropIndicator }: { component: Component, path: string, handleDrop: (e: DragEvent, path: string, index: number) => void, handleRemoveComponent: (path: string) => void, handleConditionChange: (path: string, condition: string) => void, handleComponentDragStart: (e: DragEvent<HTMLDivElement>, component: Component, path: string) => void, handleDragOver: (e: DragEvent<HTMLDivElement>, path: string, index: number) => void, handleDragEnd: () => void, dropIndicator: {path: string, index: number} | null }) => {
    
    const DropIndicator = ({path, index}: {path: string, index: number}) => {
        if (!dropIndicator || dropIndicator.path !== path || dropIndicator.index !== index) return null;
        return <div className="absolute left-0 right-0 h-1 bg-primary/50 -top-1" />
    }

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => e.currentTarget.classList.add('bg-accent/20', 'border-accent');
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => e.currentTarget.classList.remove('bg-accent/20', 'border-accent');

    if (component.type === 'if-else') {
        return (
            <div 
              draggable 
              onDragStart={(e) => handleComponentDragStart(e, component, path)}
              onDragEnd={handleDragEnd}
              className="p-4 rounded-lg border bg-muted/20 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-grab">
                        <GripVertical className="size-5 text-muted-foreground" />
                        {getComponentIcon(component.name)}
                        <Label htmlFor={`condition-${component.id}`} className="font-semibold">If</Label>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemoveComponent(path)}>
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
                <Input
                    id={`condition-${component.id}`}
                    placeholder="e.g. User-Name == 'test'"
                    value={component.condition || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleConditionChange(path, e.target.value)}
                />
                
                <Label className="font-medium text-sm">Then</Label>
                <DropZone
                    onDrop={(e) => { handleDrop(e, `${path}.if`, component.if?.length || 0); handleDragLeave(e); }}
                    onDragOver={(e) => handleDragOver(e, `${path}.if`, component.if?.length || 0)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    isEmpty={!component.if || component.if.length === 0}
                >
                    {component.if?.map((comp, index) => (
                      <div key={`${path}.if.${index}-${comp.id}`} className="relative transition-all" onDragOver={(e) => handleDragOver(e, `${path}.if`, index)} onDrop={(e) => handleDrop(e, `${path}.if`, index)}>
                        <DropIndicator path={`${path}.if`} index={index} />
                        <WorkflowComponent  component={comp} path={`${path}.if.${index}`} handleDrop={handleDrop} handleRemoveComponent={handleRemoveComponent} handleConditionChange={handleConditionChange} handleComponentDragStart={handleComponentDragStart} handleDragOver={handleDragOver} handleDragEnd={handleDragEnd} dropIndicator={dropIndicator} />
                      </div>
                    ))}
                    <div className="relative h-1">
                      <DropIndicator path={`${path}.if`} index={component.if?.length || 0} />
                    </div>
                </DropZone>
                
                <Label className="font-medium text-sm">Else</Label>
                <DropZone
                    onDrop={(e) => { handleDrop(e, `${path}.else`, component.else?.length || 0); handleDragLeave(e); }}
                    onDragOver={(e) => handleDragOver(e, `${path}.else`, component.else?.length || 0)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    isEmpty={!component.else || component.else.length === 0}
                >
                   {component.else?.map((comp, index) => (
                      <div key={`${path}.else.${index}-${comp.id}`} className="relative transition-all" onDragOver={(e) => handleDragOver(e, `${path}.else`, index)} onDrop={(e) => handleDrop(e, `${path}.else`, index)}>
                         <DropIndicator path={`${path}.else`} index={index} />
                        <WorkflowComponent component={comp} path={`${path}.else.${index}`} handleDrop={handleDrop} handleRemoveComponent={handleRemoveComponent} handleConditionChange={handleConditionChange} handleComponentDragStart={handleComponentDragStart} handleDragOver={handleDragOver} handleDragEnd={handleDragEnd} dropIndicator={dropIndicator}/>
                      </div>
                  ))}
                   <div className="relative h-1">
                        <DropIndicator path={`${path}.else`} index={component.else?.length || 0} />
                    </div>
                </DropZone>
            </div>
        );
    }
    
    return (
        <div 
            draggable 
            onDragStart={(e) => handleComponentDragStart(e, component, path)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-2 rounded-lg border p-3 bg-card/80 shadow-sm transition-all"
        >
            <GripVertical className="size-5 text-muted-foreground cursor-grab" />
            {getComponentIcon(component.name)}
            <span className="flex-1 text-sm font-medium">{component.name}</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemoveComponent(path)}>
                <Trash2 className="size-4 text-destructive" />
            </Button>
        </div>
    );
}

const getIn = (obj: any, path: string[]): any => {
    let current = obj;
    for (const key of path) {
        if (current === undefined || current === null) return undefined;
        // If current is an array, we might need to find an element by id
        if (Array.isArray(current) && !/^\d+$/.test(key)) {
             current = current.find(item => item && item.id === key);
        } else {
            current = current[key];
        }
    }
    return current;
};


export default function WorkflowsPage() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<Workflows>({
        'Default': JSON.parse(JSON.stringify(emptyWorkflow)),
        'Guest-Wifi': JSON.parse(JSON.stringify(emptyWorkflow)),
        'VPN-Users': JSON.parse(JSON.stringify(emptyWorkflow)),
    });
    const [selectedWorkflow, setSelectedWorkflow] = useState('Default');

    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{path: string, index: number} | null>(null);

    const handleLibraryDragStart = (e: DragEvent<HTMLDivElement>, component: LibraryComponent) => {
        setDraggedItem({ component });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleComponentDragStart = (e: DragEvent<HTMLDivElement>, component: Component, path: string) => {
        setDraggedItem({ component, sourcePath: path });
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };
    
    const handleDragOver = (e: DragEvent, path: string, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedItem) {
             setDropIndicator({ path, index });
        }
    };
    
    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setDropIndicator(null);
    }
    
    const handleDragEnd = () => {
      setDraggedItem(null);
      setDropIndicator(null);
    };

    const handleDrop = (e: DragEvent, path: string, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedItem) {
            setWorkflows(prevWorkflows => {
                const newWorkflows = JSON.parse(JSON.stringify(prevWorkflows));
                let workflow = newWorkflows[selectedWorkflow];
                let droppedComponent: Component;

                // Move vs Add New
                if (draggedItem.sourcePath) {
                    const sourcePathParts = draggedItem.sourcePath.split('.');
                    const sourceCollectionPathParts = sourcePathParts.slice(0, -1);
                    const sourceIndex = parseInt(sourcePathParts.pop()!, 10);
                    
                    const sourceParent = getIn(workflow, sourceCollectionPathParts);
                    if (sourceParent && Array.isArray(sourceParent.components)) {
                         [droppedComponent] = sourceParent.components.splice(sourceIndex, 1);
                    } else if(sourceParent && Array.isArray(sourceParent)) {
                         [droppedComponent] = sourceParent.splice(sourceIndex, 1);
                    }
                     else {
                        console.error("Could not find source collection for moved component", sourceParent);
                        return prevWorkflows; //
                    }
                } else {
                    const newId = `${draggedItem.component.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}-${Math.random()}`;
                    droppedComponent = { ...draggedItem.component, id: newId } as Component;
                    if (droppedComponent.type === 'if-else') {
                        droppedComponent.if = [];
                        droppedComponent.else = [];
                        droppedComponent.condition = '';
                    }
                }
                
                if(!droppedComponent) {
                    console.error("Could not determine dropped component");
                    return prevWorkflows;
                }

                const destPathParts = path.split('.');
                const destCollection = getIn(workflow, destPathParts);

                if (destCollection && Array.isArray(destCollection)) {
                    destCollection.splice(index, 0, droppedComponent);
                } else if(destCollection && Array.isArray(destCollection.components)) {
                    destCollection.components.splice(index, 0, droppedComponent);
                }
                else {
                     console.error("Could not find destination collection");
                }
                
                return newWorkflows;
            });
        }
        
        handleDragEnd();
    };
    
    const handleRemoveComponent = (path: string) => {
        setWorkflows(prevWorkflows => {
            const newWorkflows = JSON.parse(JSON.stringify(prevWorkflows));
            const workflow = newWorkflows[selectedWorkflow];
            
            const pathParts = path.split('.');
            const collectionPath = pathParts.slice(0, -1);
            const indexToRemove = parseInt(pathParts[pathParts.length - 1]);

            const parent = getIn(workflow, collectionPath);

            let collection: Component[] | undefined;

            if (parent && Array.isArray(parent)) {
                collection = parent;
            } else if (parent && parent.components && Array.isArray(parent.components)) {
                collection = parent.components;
            }

            if (collection) {
                collection.splice(indexToRemove, 1);
            } else {
                console.error("Could not find collection to remove from");
            }
            
            return newWorkflows;
        });
    }

    const handleConditionChange = (path: string, condition: string) => {
        setWorkflows(prevWorkflows => {
            const newWorkflows = JSON.parse(JSON.stringify(prevWorkflows));
            const workflow = newWorkflows[selectedWorkflow];
            const pathParts = path.split('.');
            
            const componentToUpdate = getIn(workflow, pathParts);

            if(componentToUpdate){
                componentToUpdate.condition = condition;
            } else {
                console.error("Could not find component to update condition");
            }

            return newWorkflows;
        });
    }

    const clearWorkflow = () => {
         setWorkflows(prev => ({
            ...prev,
            [selectedWorkflow]: JSON.parse(JSON.stringify(emptyWorkflow))
        }));
    }

    const createNewWorkflow = () => {
        const newWorkflowName = `New Workflow ${Object.keys(workflows).length + 1}`;
        setWorkflows(prev => ({
            ...prev,
            [newWorkflowName]: JSON.parse(JSON.stringify(emptyWorkflow))
        }));
        setSelectedWorkflow(newWorkflowName);
    }
    
    const duplicateWorkflow = () => {
        const newWorkflowName = `${selectedWorkflow} (Copy)`;
        setWorkflows(prev => ({
            ...prev,
            [newWorkflowName]: JSON.parse(JSON.stringify(workflows[selectedWorkflow]))
        }));
        setSelectedWorkflow(newWorkflowName);
    }

    const currentWorkflow = workflows[selectedWorkflow] || [];

    const DropIndicator = ({path, index}: {path: string, index: number}) => {
        if (!dropIndicator || dropIndicator.path !== path || dropIndicator.index !== index) return null;
        return <div className="absolute left-0 right-0 h-1 bg-primary/50 -top-1" />
    }


    return (
        <div className="grid h-full min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 md:grid-cols-3">
            <aside className="md:col-span-1">
                <Card className="glass-card sticky top-24">
                    <CardHeader>
                        <CardTitle>Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Accordion type="multiple" className="w-full space-y-2">
                            {componentLibrary.map((category, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg">
                                    <AccordionTrigger className="p-4">
                                        <div className="flex items-center gap-3">
                                            {category.icon}
                                            <span className="font-semibold">{category.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 space-y-2">
                                        {category.components.map((comp, compIndex) => (
                                            <DraggableComponent key={comp.name + compIndex} component={comp} onDragStart={handleLibraryDragStart}/>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-2">
                <Card className="glass-card flex min-h-[80vh] flex-col">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div className="flex-1">
                            <CardTitle>Flow Builder</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                                    <SelectTrigger className="w-full max-w-xs">
                                        <SelectValue placeholder="Select a workflow" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(workflows).map(wf => (
                                            <SelectItem key={wf} value={wf}>{wf}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 <Button variant="ghost" size="icon" onClick={createNewWorkflow}><PlusCircle className="text-muted-foreground" /></Button>
                                <Button variant="ghost" size="icon" onClick={duplicateWorkflow}><Copy className="text-muted-foreground" /></Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearWorkflow}>Clear</Button>
                            <Button variant="outline" onClick={() => router.push('/testing')}>Save &amp; Test</Button>
                            <Button>Save & Deploy</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4">
                        <Accordion type="multiple" defaultValue={['authorize', 'authenticate', 'accounting', 'post-auth']} className="w-full space-y-4">
                            {currentWorkflow.map(phase => (
                                <AccordionItem key={phase.id} value={phase.id}>
                                    <AccordionTrigger className="font-semibold text-lg px-4 bg-muted/30 rounded-t-lg">
                                        {phase.name}
                                    </AccordionTrigger>
                                    <AccordionContent 
                                        className="border border-t-0 rounded-b-lg"
                                    >
                                        <DropZone
                                            onDrop={(e) => handleDrop(e, `${phase.id}.components`, phase.components.length)}
                                            onDragOver={(e) => handleDragOver(e, `${phase.id}.components`, phase.components.length)}
                                            onDragEnter={(e) => e.currentTarget.classList.add('bg-accent/20', 'border-accent')}
                                            onDragLeave={(e) => { handleDragLeave(e); e.currentTarget.classList.remove('bg-accent/20', 'border-accent');}}
                                            onDragEnd={handleDragEnd}
                                            isEmpty={phase.components.length === 0}
                                        >
                                            {phase.components.map((component, index) => (
                                                <div 
                                                    key={`${phase.id}.components.${index}-${component.id}`}
                                                    className="relative transition-all"
                                                    onDragOver={(e) => handleDragOver(e, `${phase.id}.components`, index)}
                                                    onDrop={(e) => handleDrop(e, `${phase.id}.components`, index)}
                                                >
                                                    <DropIndicator path={`${phase.id}.components`} index={index} />
                                                    <WorkflowComponent
                                                        component={component}
                                                        path={`${phase.id}.components.${index}`}
                                                        handleDrop={handleDrop}
                                                        handleRemoveComponent={handleRemoveComponent}
                                                        handleConditionChange={handleConditionChange}
                                                        handleComponentDragStart={handleComponentDragStart}
                                                        handleDragOver={handleDragOver}
                                                        handleDragEnd={handleDragEnd}
                                                        dropIndicator={dropIndicator}
                                                    />
                                                </div>
                                            ))}
                                             <div className="relative h-1">
                                                <DropIndicator path={`${phase.id}.components`} index={phase.components.length} />
                                            </div>
                                        </DropZone>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
