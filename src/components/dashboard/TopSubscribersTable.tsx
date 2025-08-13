
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const topSubscribers = [
  {
    id: 'user_three',
    username: 'user_three',
    product: 'Premium',
    dataUp: '8.1 GB',
    dataDown: '24.3 GB',
  },
  {
    id: 'user1@example.com',
    username: 'user1@example.com',
    product: 'Premium',
    dataUp: '5.2 GB',
    dataDown: '15.6 GB',
  },
  {
    id: 'john.doe',
    username: 'john.doe',
    product: 'Basic',
    dataUp: '2.3 GB',
    dataDown: '8.9 GB',
  },
  {
    id: 'corp-user-32',
    username: 'corp-user-32',
    product: 'Enterprise',
    dataUp: '1.8 GB',
    dataDown: '6.4 GB',
  },
  {
    id: 'guest-wifi',
    username: 'guest-wifi',
    product: 'Guest',
    dataUp: '0.5 GB',
    dataDown: '2.1 GB',
  }
];

export function TopSubscribersTable() {
    return (
        <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Top Subscribers by Usage</CardTitle>
                    <CardDescription>Most active users in the last 24 hours.</CardDescription>
                </div>
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/subscribers">View all <ArrowRight className="ml-2 size-4" /></Link>
                 </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Usage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSubscribers.map((subscriber) => (
                            <TableRow key={subscriber.id}>
                                <TableCell className="font-medium">{subscriber.username}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{subscriber.product}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <div className="flex items-center justify-end gap-3">
                                        <div className="flex items-center gap-1 text-green-400">
                                            <ArrowUp className="size-3" />
                                            <span className="text-xs">{subscriber.dataUp}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-red-400">
                                            <ArrowDown className="size-3" />
                                            <span className="text-xs">{subscriber.dataDown}</span>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
