import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Share2, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const history = [
    { version: 'v1.2.3', author: 'admin', date: '2024-07-21 14:30', notes: 'Updated Cisco profile', type: 'Update' },
    { version: 'v1.2.2', author: 'admin', date: '2024-07-20 09:15', notes: 'Initial setup', type: 'Create' },
    { version: 'v1.2.1', author: 'system', date: '2024-07-19 18:00', notes: 'Auto-saved workflow', type: 'Auto-save' },
]

export default function ConfigurationPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Configuration Management</CardTitle>
                    <CardDescription>Import, export, or share your Monify SaaS configuration.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Button size="lg" variant="outline">
                        <Upload className="mr-2 size-5" />
                        Import Config
                    </Button>
                    <Button size="lg" variant="outline">
                        <Download className="mr-2 size-5" />
                        Export Config
                    </Button>
                     <Button size="lg">
                        <Share2 className="mr-2 size-5" />
                        Share
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Configuration History</CardTitle>
                    <CardDescription>Review and restore previous versions of your configuration.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.version}>
                                    <TableCell><Badge variant="outline">{item.version}</Badge></TableCell>
                                    <TableCell>{item.author}</TableCell>
                                    <TableCell>{item.notes}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Restore</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </div>
    );
}
