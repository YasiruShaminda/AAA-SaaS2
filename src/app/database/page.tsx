
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Column = {
    id: string;
    name: string;
    type: string;
    length?: number;
    attribute: string;
    defaultValue: string;
};

type DbTable = {
    id: string;
    name: string;
    columns: Column[];
};

const initialTables: DbTable[] = [
    {
        id: 'tbl_1',
        name: 'radacct',
        columns: [
            { id: 'col_1_1', name: 'username', type: 'VARCHAR', length: 64, attribute: 'User-Name', defaultValue: '' },
            { id: 'col_1_2', name: 'acctsessionid', type: 'VARCHAR', length: 64, attribute: 'Acct-Session-Id', defaultValue: '' },
            { id: 'col_1_3', name: 'framedipaddress', type: 'VARCHAR', length: 15, attribute: 'Framed-IP-Address', defaultValue: '' },
            { id: 'col_1_4', name: 'acctsessiontime', type: 'INTEGER', attribute: 'Acct-Session-Time', defaultValue: '0' },
        ]
    }
];

const radiusAttributes = [
    'User-Name', 'User-Password', 'Acct-Session-Id', 'Acct-Session-Time',
    'Framed-IP-Address', 'NAS-IP-Address', 'Called-Station-Id', 'Calling-Station-Id'
];

const dataTypes = ['VARCHAR', 'INTEGER', 'TEXT', 'TIMESTAMP', 'BOOLEAN'];

export default function DatabasePage() {
    const [dbType, setDbType] = useState('mysql');
    const [poolSize, setPoolSize] = useState([20]);
    const [selectedDb, setSelectedDb] = useState('db1');
    const [tables, setTables] = useState(initialTables);

    const addTable = () => {
        const newTableId = `tbl_${Date.now()}`;
        setTables([
            ...tables,
            {
                id: newTableId,
                name: `new_table_${tables.length + 1}`,
                columns: [{ id: `col_${newTableId}_1`, name: 'id', type: 'INTEGER', attribute: '', defaultValue: '' }]
            }
        ]);
    };

    const deleteTable = (tableId: string) => {
        setTables(tables.filter(t => t.id !== tableId));
    };

    const addColumn = (tableId: string) => {
        setTables(tables.map(table => {
            if (table.id === tableId) {
                const newColumn: Column = {
                    id: `col_${tableId}_${Date.now()}`,
                    name: 'new_column',
                    type: 'VARCHAR',
                    length: 255,
                    attribute: '',
                    defaultValue: ''
                };
                return { ...table, columns: [...table.columns, newColumn] };
            }
            return table;
        }));
    };

    const deleteColumn = (tableId: string, columnId: string) => {
        setTables(tables.map(table => {
            if (table.id === tableId) {
                return { ...table, columns: table.columns.filter(c => c.id !== columnId) };
            }
            return table;
        }));
    };

    const handleColumnChange = (tableId: string, columnId: string, field: keyof Column, value: string | number) => {
         setTables(tables.map(table => {
            if (table.id === tableId) {
                const updatedColumns = table.columns.map(col => {
                    if (col.id === columnId) {
                        const finalValue = field === 'attribute' && value === 'none' ? '' : value;
                        return { ...col, [field]: finalValue };
                    }
                    return col;
                });
                return { ...table, columns: updatedColumns };
            }
            return table;
        }));
    };
    
    const handleTableNameChange = (tableId: string, newName: string) => {
         setTables(tables.map(table => {
            if (table.id === tableId) {
                return { ...table, name: newName };
            }
            return table;
        }));
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Database Configurations</CardTitle>
                            <CardDescription>Manage connection settings for your data sources.</CardDescription>
                        </div>
                        <Button variant="outline"><PlusCircle className="mr-2"/> Add Connection</Button>
                    </div>
                </CardHeader>
                 <CardContent>
                    <Label htmlFor="db-connection">Active Configuration</Label>
                    <Select value={selectedDb} onValueChange={setSelectedDb}>
                        <SelectTrigger id="db-connection">
                            <SelectValue placeholder="Select a configuration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="db1">Primary DB (MySQL)</SelectItem>
                            <SelectItem value="db2">LDAP Auth (LDAP)</SelectItem>
                            <SelectItem value="db3">Legacy Users (PostgreSQL)</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Connection Details</CardTitle>
                    <CardDescription>Manage credentials and connection type for the selected database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="db-type">Database Type</Label>
                            <Select value={dbType} onValueChange={setDbType}>
                                <SelectTrigger id="db-type">
                                    <SelectValue placeholder="Select DB Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mysql">MySQL</SelectItem>
                                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                    <SelectItem value="mssql">Microsoft SQL</SelectItem>
                                    <SelectItem value="ldap">LDAP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="db-host">Host</Label>
                            <Input id="db-host" defaultValue="db.example.com" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="db-user">Username</Label>
                            <Input id="db-user" defaultValue="radius_user" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="db-pass">Password</Label>
                            <Input id="db-pass" type="password" defaultValue="s3cur3p@ssw0rd" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button>Test &amp; Save Connection</Button>
                </CardFooter>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Performance Tuning</CardTitle>
                    <CardDescription>Adjust parameters to optimize database performance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                             <Label>Connection Pool Size</Label>
                             <span className="text-muted-foreground">{poolSize[0]}</span>
                        </div>
                        <Slider
                            defaultValue={poolSize}
                            onValueChange={setPoolSize}
                            max={100}
                            step={1}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="max-threads">Max Helper Threads</Label>
                            <Input id="max-threads" type="number" defaultValue="32" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="req-timeout">Request Timeout (ms)</Label>
                            <Input id="req-timeout" type="number" defaultValue="5000" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Table Management</CardTitle>
                        <CardDescription>Define database tables for accounting and other purposes.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={addTable}><PlusCircle className="mr-2" /> Add Table</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion type="multiple" className="w-full">
                        {tables.map(table => (
                            <AccordionItem value={table.id} key={table.id} className="border-x-0 border-t-0 px-6">
                                <div className="flex items-center">
                                    <AccordionTrigger className="flex-1 py-4 text-lg font-semibold">
                                       {table.name}
                                    </AccordionTrigger>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTable(table.id)}>
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Column Name</TableHead>
                                                <TableHead>Data Type</TableHead>
                                                <TableHead>Length</TableHead>
                                                <TableHead>RADIUS Attribute</TableHead>
                                                <TableHead>Default Value</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {table.columns.map(col => (
                                                <TableRow key={col.id}>
                                                    <TableCell>
                                                        <Input value={col.name} onChange={(e) => handleColumnChange(table.id, col.id, 'name', e.target.value)} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select value={col.type} onValueChange={(value) => handleColumnChange(table.id, col.id, 'type', value)}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {dataTypes.map(dt => <SelectItem key={dt} value={dt}>{dt}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            value={col.length ?? ''} 
                                                            onChange={(e) => handleColumnChange(table.id, col.id, 'length', parseInt(e.target.value, 10))} 
                                                            disabled={col.type !== 'VARCHAR'}
                                                        />
                                                    </TableCell>
                                                     <TableCell>
                                                        <Select value={col.attribute || 'none'} onValueChange={(value) => handleColumnChange(table.id, col.id, 'attribute', value)}>
                                                            <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">(None)</SelectItem>
                                                                {radiusAttributes.map(attr => <SelectItem key={attr} value={attr}>{attr}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input value={col.defaultValue} onChange={(e) => handleColumnChange(table.id, col.id, 'defaultValue', e.target.value)} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => deleteColumn(table.id, col.id)}>
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => addColumn(table.id)}>
                                        <PlusCircle className="mr-2 size-4" /> Add Column
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
