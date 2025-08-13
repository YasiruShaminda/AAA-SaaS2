
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Wifi, Building, Phone, ArrowRight, ArrowLeft, PlusCircle, Trash2, FileCheck2, TableIcon, PartyPopper } from 'lucide-react';
import { Cisco, Ruckus, Actiontec } from '@/components/icons/vendors';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const vendors = [
    { id: 'cisco', name: 'Cisco', icon: <Cisco className="w-8 h-8" /> },
    { id: 'ruckus', name: 'Ruckus', icon: <Ruckus className="w-8 h-8" /> },
    { id: 'actiontec', name: 'Actiontec', icon: <Actiontec className="w-8 h-8" /> },
];

const steps = [
    { id: '01', name: 'AAA Type' },
    { id: '02', name: 'Vendor Setup' },
    { id: '03', name: 'Authentication' },
    { id: '04', name: 'Import Users' },
];

type Client = {
    id: number;
    vendor: string;
    ip: string;
    secret: string;
};

type AuthMethods = {
    [vendorId: string]: string;
}

type ColumnMapping = {
    username: string;
    password: string;
};

export default function QuickStartPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [aaaName, setAaaName] = useState('');
    const [selectedAAAType, setSelectedAAAType] = useState<string | null>(null);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [authMethods, setAuthMethods] = useState<AuthMethods>({});
    
    // State for CSV import
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvPreview, setCsvPreview] = useState<string[][]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ username: '', password: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleVendorToggle = (vendorId: string) => {
        const isCurrentlySelected = selectedVendors.includes(vendorId);
        
        if (isCurrentlySelected) {
            setSelectedVendors(prev => prev.filter(v => v !== vendorId));
            setClients(prev => prev.filter(c => c.vendor !== vendorId));
            setAuthMethods(prev => {
                const newAuth = {...prev};
                delete newAuth[vendorId];
                return newAuth;
            });
        } else {
            setSelectedVendors(prev => [...prev, vendorId]);
            if (clients.filter(c => c.vendor === vendorId).length === 0) {
               addClient(vendorId);
            }
        }
    };

    const addClient = (vendorId: string) => {
        setClients(prev => [...prev, { id: Date.now(), vendor: vendorId, ip: '', secret: '' }]);
    };
    
    const removeClient = (clientId: number) => {
        setClients(prev => prev.filter(c => c.id !== clientId));
    };

    const handleClientChange = (clientId: number, field: 'ip' | 'secret', value: string) => {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, [field]: value } : c));
    };

    const handleAuthMethodChange = (vendorId: string, value: string) => {
        setAuthMethods(prev => ({...prev, [vendorId]: value}));
    }
    
    const parseCsvLine = (line: string): string[] => {
        return line.trim().split(',').map(cell => cell.replace(/"/g, ''));
    }

    const handleFileSelect = (file: File) => {
        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = parseCsvLine(lines[0]);
            const preview = lines.slice(1, 4).map(line => parseCsvLine(line));
            
            setCsvHeaders(headers);
            setCsvPreview(preview);
            
            const initialMapping: ColumnMapping = { username: '', password: '' };
            headers.forEach(h => {
                const headerLower = h.toLowerCase();
                if (headerLower.includes('user') && !initialMapping.username) {
                    initialMapping.username = h;
                } else if (headerLower.includes('pass') && !initialMapping.password) {
                    initialMapping.password = h;
                }
            });
            setColumnMapping(initialMapping);
        };
        reader.readAsText(file);
    };

    const handleMappingChange = (field: 'username' | 'password', value: string) => {
        setColumnMapping(prev => ({...prev, [field]: value}));
    }

    const isStepComplete = () => {
        switch (currentStep) {
            case 0:
                return !!selectedAAAType && !!aaaName;
            case 1:
                return selectedVendors.length > 0 && clients.every(c => c.ip && c.secret);
            case 2:
                return selectedVendors.every(v => authMethods[v]);
            case 3:
                return !!csvFile && !!columnMapping.username && !!columnMapping.password;
            default:
                return false;
        }
    };

    const finishSetup = () => {
        if(isStepComplete()) {
            localStorage.setItem('aaaName', aaaName);
            setShowSuccessDialog(true);
        }
    }

    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Quick Start Setup</CardTitle>
                    <CardDescription>Configure your AAA system in a few simple steps.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-8 flex items-center justify-between">
                        {steps.map((step, index) => (
                             <div key={step.id} className="flex items-center flex-1">
                                <div className={cn(
                                    "flex size-10 items-center justify-center rounded-full font-bold transition-colors",
                                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {step.id}
                                </div>
                                <div className="ml-4 hidden sm:block">
                                    <h3 className="font-semibold">{step.name}</h3>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="mx-4 h-px flex-1 bg-border" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="min-h-[450px]">
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Step 1: Select AAA Type</h2>
                                <p className="text-muted-foreground">Choose the type of network you are configuring.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="aaa-name">AAA System Name</Label>
                                    <Input id="aaa-name" placeholder="e.g., 'Primary Corporate AAA'" value={aaaName} onChange={(e) => setAaaName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>AAA Type</Label>
                                    <Select onValueChange={setSelectedAAAType} value={selectedAAAType || ''}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select AAA Type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wifi">
                                                <div className="flex items-center gap-2"><Wifi /> Wi-Fi Hotspot</div>
                                            </SelectItem>
                                            <SelectItem value="enterprise">
                                                <div className="flex items-center gap-2"><Building /> Enterprise Network</div>
                                            </SelectItem>
                                            <SelectItem value="telco">
                                                <div className="flex items-center gap-2"><Phone /> Telco/ISP</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Step 2: AP Vendor Setup</h2>
                                <p className="text-muted-foreground">Select the vendors in your network and provide client details.</p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {vendors.map(vendor => (
                                        <Label key={vendor.id} htmlFor={vendor.id} className={cn("flex flex-col items-center justify-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors hover:border-accent", selectedVendors.includes(vendor.id) && "border-primary ring-2 ring-primary")}>
                                            <Checkbox id={vendor.id} className="sr-only" onCheckedChange={() => handleVendorToggle(vendor.id)} checked={selectedVendors.includes(vendor.id)} />
                                            {vendor.icon}
                                            <span className="font-semibold">{vendor.name}</span>
                                        </Label>
                                    ))}
                                </div>
                                {selectedVendors.map(vendorId => (
                                    <div key={vendorId} className="space-y-4 rounded-lg border p-4">
                                        <h3 className="font-semibold">{vendors.find(v => v.id === vendorId)?.name} Client Details</h3>
                                        {clients.filter(c => c.vendor === vendorId).map((client, index) => (
                                            <div key={client.id} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] items-center">
                                                <Input placeholder="Client IP Address" value={client.ip} onChange={e => handleClientChange(client.id, 'ip', e.target.value)} />
                                                <Input type="password" placeholder="Shared Secret" value={client.secret} onChange={e => handleClientChange(client.id, 'secret', e.target.value)} />
                                                <Button variant="ghost" size="icon" onClick={() => removeClient(client.id)} disabled={clients.filter(c => c.vendor === vendorId).length <= 1}>
                                                    <Trash2 className="size-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addClient(vendorId)}><PlusCircle className="mr-2 size-4" /> Add another client</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Step 3: Authentication Methods</h2>
                                <p className="text-muted-foreground">Configure the authentication methods for your selected vendors.</p>
                                {selectedVendors.length === 0 ? <p className="text-muted-foreground">Please select at least one vendor in the previous step.</p> : (
                                    selectedVendors.map((vendorId, index) => (
                                        <div key={vendorId}>
                                            <div className="space-y-2">
                                                <Label>{vendors.find(v => v.id === vendorId)?.name}</Label>
                                                <Select onValueChange={(value) => handleAuthMethodChange(vendorId, value)} value={authMethods[vendorId] || ''}>
                                                    <SelectTrigger><SelectValue placeholder="Select auth method..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pap">PAP</SelectItem>
                                                        <SelectItem value="chap">CHAP</SelectItem>
                                                        <SelectItem value="mschap">MS-CHAP</SelectItem>
                                                        <SelectItem value="eap-tls">EAP-TLS</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {index < selectedVendors.length - 1 && <Separator className="my-6" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Step 4: Import Subscribers</h2>
                                {!csvFile ? (
                                    <>
                                        <p className="text-muted-foreground">Import your user or subscriber data from a CSV file.</p>
                                        <div
                                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-background/50 p-12 cursor-pointer hover:border-primary"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <Upload className="size-12 text-muted-foreground" />
                                            <p className="mt-4">Drag and drop your CSV file here or</p>
                                            <Button variant="link">Browse files</Button>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept=".csv"
                                                onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                                            <FileCheck2 className="size-6 text-green-500" />
                                            <p className="font-semibold">{csvFile.name}</p>
                                            <Button variant="link" size="sm" onClick={() => setCsvFile(null)}>Change file</Button>
                                        </div>

                                        <h3 className="text-lg font-semibold">Map Columns</h3>
                                        <p className="text-muted-foreground">
                                            Tell us which columns contain the username and password.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Username Column</Label>
                                                <Select onValueChange={(value) => handleMappingChange('username', value)} value={columnMapping.username}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select username column..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {csvHeaders.map(header => <SelectItem key={`user-${header}`} value={header}>{header}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password Column</Label>
                                                <Select onValueChange={(value) => handleMappingChange('password', value)} value={columnMapping.password}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select password column..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {csvHeaders.map(header => <SelectItem key={`pass-${header}`} value={header}>{header}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold pt-4">Data Preview (First 3 rows)</h3>
                                        <Card>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {csvHeaders.map(h => <TableHead key={h}>{h}</TableHead>)}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {csvPreview.map((row, i) => (
                                                    <TableRow key={i}>
                                                        {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={goToPrevStep} disabled={currentStep === 0}>
                        <ArrowLeft className="mr-2" />
                        Previous
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button onClick={goToNextStep} disabled={!isStepComplete()}>
                            Next
                            <ArrowRight className="ml-2" />
                        </Button>
                    ) : (
                        <Button disabled={!isStepComplete()} onClick={finishSetup}>Finish Setup</Button>
                    )}
                </CardFooter>
            </Card>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-primary/10 rounded-full border border-primary/20">
                            <PartyPopper className="size-8 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-center">Congratulations!</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            You have successfully set up your first AAA system!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full" onClick={() => router.push('/')}>Go to the Dashboard</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
