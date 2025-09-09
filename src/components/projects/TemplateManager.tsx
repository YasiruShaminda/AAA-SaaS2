
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Folder, File, RefreshCw, Copy, Trash2, Pencil, FolderPlus } from 'lucide-react';

export type ProfileTemplate = {
    id: string;
    name: string;
    type: 'folder' | 'template';
    attributes?: {
        checkAttributes?: string[];
        replyAttributes?: string[];
        vendorAttributes?: string[];
        accountingAttributes?: string[];
    };
    children?: ProfileTemplate[];
};

const sampleTemplates: ProfileTemplate[] = [
    {
        id: 'cat-vendor',
        name: 'Vendor Specific',
        type: 'folder',
        children: [
            {
                id: 'cat-cisco',
                name: 'Cisco',
                type: 'folder',
                children: [
                    { id: 'tpl-cisco-ios', name: 'Cisco IOS', type: 'template', attributes: { vendorAttributes: ['Cisco-AVPair=shell:priv-lvl=15'] } }
                ],
            },
            {
                id: 'cat-ruckus',
                name: 'Ruckus',
                type: 'folder',
                children: [
                    { id: 'tpl-ruckus-wlan', name: 'Ruckus WLAN', type: 'template', attributes: { replyAttributes: ['Ruckus-Wlan-ID=1'] } },
                ]
            }
        ]
    },
    {
        id: 'cat-usecase',
        name: 'Use Cases',
        type: 'folder',
        children: [
            { id: 'tpl-hotspot', name: 'Public Wi-Fi Hotspot', type: 'template', attributes: { authEnabled: true, acctEnabled: false, replyAttributes: ['Session-Timeout=3600'] } },
            { id: 'tpl-fttx', name: 'FTTX Residential', type: 'template', attributes: { authEnabled: true, acctEnabled: true, checkAttributes: ['User-Name', 'User-Password'], replyAttributes: ['Framed-IP-Address', 'Framed-Pool=pool1'] } }
        ]
    }
];

function TreeViewItem({ item, level, selected, onSelect, expanded, onToggle, getPath }: { item: ProfileTemplate, level: number, selected: string | null, onSelect: (item: ProfileTemplate) => void, expanded: Set<string>, onToggle: (id: string) => void, getPath: (id: string) => string }) {
    const isFolder = item.type === 'folder';
    const isExpanded = expanded.has(item.id);
    const Icon = isFolder ? Folder : File;
    const ExpandIcon = isExpanded ? Minus : Plus;

    return (
        <div>
            <div 
                className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted/50 ${selected === item.id ? 'bg-primary/20' : ''}`}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                onClick={() => onSelect(item)}
            >
                {isFolder ? (
                    <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="mr-2 p-1 hover:bg-muted rounded-full"><ExpandIcon className="size-4" /></button>
                ) : (
                    <div className="w-8"></div>
                )}
                <Icon className="size-4 mr-2" />
                <span>{item.name}</span>
            </div>
            {isFolder && isExpanded && item.children && (
                <div>
                    {item.children.map(child => (
                        <TreeViewItem 
                            key={child.id}
                            item={child}
                            level={level + 1}
                            selected={selected}
                            onSelect={onSelect}
                            expanded={expanded}
                            onToggle={onToggle}
                            getPath={getPath}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

type TemplateManagerDialogProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: ProfileTemplate) => void;
};

export function TemplateManagerDialog({ children, open, onOpenChange, onSelectTemplate }: TemplateManagerDialogProps) {
    const [templates, setTemplates] = useState(sampleTemplates);
    const [selectedItem, setSelectedItem] = useState<ProfileTemplate | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['cat-vendor', 'cat-usecase']));

    const idToPathMap = useMemo(() => {
        const map = new Map<string, string>();
        function traverse(items: ProfileTemplate[], currentPath: string) {
            items.forEach(item => {
                const newPath = `${currentPath} > ${item.name}`;
                map.set(item.id, newPath);
                if (item.children) {
                    traverse(item.children, newPath);
                }
            });
        }
        traverse(templates, 'Templates');
        return map;
    }, [templates]);

    const getPath = (id: string) => idToPathMap.get(id) || 'Templates';

    const handleToggleFolder = (id: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        if (selectedItem && selectedItem.type === 'template') {
            onSelectTemplate(selectedItem);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Profile Template Manager</DialogTitle>
                    <DialogDescription>Browse, select, and manage your RADIUS profile templates.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                    <div className="col-span-1 flex flex-col gap-2">
                         <div className="p-2 border rounded-lg bg-muted/30">
                            <Input readOnly value={selectedItem ? getPath(selectedItem.id) : 'Templates'} />
                        </div>
                        <div className="p-2 border rounded-lg flex-1">
                            <ScrollArea className="h-full">
                                {templates.map(item => (
                                    <TreeViewItem 
                                        key={item.id}
                                        item={item}
                                        level={0}
                                        selected={selectedItem?.id || null}
                                        onSelect={setSelectedItem}
                                        expanded={expandedFolders}
                                        onToggle={handleToggleFolder}
                                        getPath={getPath}
                                    />
                                ))}
                            </ScrollArea>
                        </div>
                    </div>
                    <div className="col-span-2 p-4 border rounded-lg">
                        {selectedItem ? (
                             <div>
                                <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {selectedItem.type === 'folder' ? 'This is a category folder.' : 'This is a profile template.'}
                                </p>
                                {selectedItem.type === 'template' && (
                                    <pre className="p-2 bg-muted/50 rounded-md text-xs overflow-auto">
                                        {JSON.stringify(selectedItem.attributes, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Select a template or folder to see details.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"><FolderPlus className="mr-2"/> New Folder</Button>
                        <Button variant="outline" size="sm" disabled={!selectedItem || selectedItem.type === 'folder'}><Pencil className="mr-2"/> Edit</Button>
                        <Button variant="outline" size="sm" disabled={!selectedItem}><Copy className="mr-2"/> Duplicate</Button>
                        <Button variant="outline" size="sm" disabled={!selectedItem} className="text-destructive hover:text-destructive"><Trash2 className="mr-2"/> Delete</Button>
                        <Button variant="outline" size="sm"><RefreshCw className="mr-2"/> Refresh</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={!selectedItem || selectedItem.type !== 'template'}>OK</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
