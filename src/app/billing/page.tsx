
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: 'Free',
        price: '$0',
        pricePeriod: '/month',
        description: 'For individuals and small projects.',
        features: ['5 Clients', '100 Subscribers', 'Basic Workflows', 'Community Support'],
        cta: 'Downgrade to Free',
        variant: 'outline'
    },
    {
        name: 'Pro',
        price: '$99',
        pricePeriod: '/month',
        description: 'For growing businesses with advanced needs.',
        features: ['50 Clients', '10,000 Subscribers', 'Advanced Workflows', 'Email & Chat Support', 'API Access'],
        cta: 'Your Current Plan',
        variant: 'default',
        isCurrent: true,
    },
    {
        name: 'Enterprise',
        price: 'Contact Us',
        pricePeriod: '',
        description: 'For large organizations with custom requirements.',
        features: ['Unlimited Clients', 'Unlimited Subscribers', 'Custom Workflows', 'Dedicated Support', 'On-premise option'],
        cta: 'Contact Sales',
        variant: 'outline'
    }
];

const billingHistory = [
    { invoice: 'INV-2024-001', date: '2024-07-01', amount: '$99.00', status: 'Paid' },
    { invoice: 'INV-2024-002', date: '2024-06-01', amount: '$99.00', status: 'Paid' },
    { invoice: 'INV-2024-003', date: '2024-05-01', amount: '$99.00', status: 'Paid' },
    { invoice: 'INV-2024-004', date: '2024-04-01', amount: '$99.00', status: 'Paid' },
];

export default function BillingPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the Pro plan.</CardDescription>
                    </div>
                     <div className="text-right">
                        <p className="text-2xl font-bold">Pro Plan</p>
                        <p className="text-sm text-muted-foreground">Next payment on August 1, 2024</p>
                    </div>
                </CardHeader>
            </Card>

            <Card className="glass-card">
                <CardHeader className="text-center">
                    <CardTitle>Plans & Features</CardTitle>
                    <CardDescription>Choose the plan that's right for you.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                            <CardHeader className="flex-1">
                                <CardTitle>{plan.name}</CardTitle>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.pricePeriod && <span className="text-muted-foreground ml-1">{plan.pricePeriod}</span>}
                                </div>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="size-4 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.isCurrent ? 'default' : 'outline'} disabled={plan.isCurrent}>
                                    {plan.cta}
                                    {!plan.isCurrent && <ArrowRight className="ml-2 size-4" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
            
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billingHistory.map(invoice => (
                                <TableRow key={invoice.invoice}>
                                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'} className="bg-green-600/20 text-green-300 border-green-500/30">
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Download className="size-4" />
                                        </Button>
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
