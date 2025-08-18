
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from 'lucide-react';

const sessions = [
    { username: 'user1@example.com', ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', profile: 'Enterprise AAA', startTime: '2024-07-22 10:00', dataUp: '1.2 GB', dataDown: '5.4 GB', status: 'active' },
    { username: 'guest-wifi', ip: '10.0.0.5', mac: 'A1:B2:C3:D4:E5:F6', profile: 'Wi-Fi Hotspot (Auth-Only)', startTime: '2024-07-22 10:05', dataUp: '500 MB', dataDown: '2.1 GB', status: 'active' },
    { username: 'john.doe', ip: '172.16.31.54', mac: 'F6:E5:D4:C3:B2:A1', profile: 'Enterprise AAA', startTime: '2024-07-22 09:45', dataUp: '2.3 GB', dataDown: '8.9 GB', status: 'active' },
    { username: 'corp-user-32', ip: '192.168.2.78', mac: '12:34:56:78:90:AB', profile: 'Enterprise AAA', startTime: '2024-07-22 08:30', dataUp: '800 MB', dataDown: '3.2 GB', status: 'active' },
];

export default function SessionsPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Real-time view of all active user sessions in the system.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>MAC Address</TableHead>
                                <TableHead>Profile</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>Data Usage</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.mac}>
                                    <TableCell className="font-medium">{session.username}</TableCell>
                                    <TableCell>{session.ip}</TableCell>
                                    <TableCell className="text-muted-foreground">{session.mac}</TableCell>
                                    <TableCell>{session.profile}</TableCell>
                                    <TableCell className="text-muted-foreground">{session.startTime}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <ArrowUp className="size-3" />
                                                <span className="text-xs">{session.dataUp}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-red-400">
                                                <ArrowDown className="size-3" />
                                                <span className="text-xs">{session.dataDown}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-green-600/20 text-green-300 border-green-500/30 hover:bg-green-600/30">
                                            {session.status}
                                        </Badge>
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
