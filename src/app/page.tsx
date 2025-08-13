
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { TopSubscribersTable } from '@/components/dashboard/TopSubscribersTable';
import { ClientStatusChart } from '@/components/dashboard/ClientStatusChart';
import { DataUsageChart } from '@/components/dashboard/DataUsageChart';
import { Server, Zap, ShieldCheck, Wifi, ArrowUp, ArrowDown } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="System Status"
                value="Operational"
                icon={<Server className="text-green-500" />}
                description="All systems running smoothly"
            />
            <StatCard
                title="Active Sessions"
                value="1,423"
                icon={<Zap className="text-accent" />}
                description="+20.1% from last hour"
                href="/sessions"
            />
            <StatCard
                title="Online Clients"
                value="45 / 50"
                icon={<Wifi className="text-blue-500" />}
                description="5 clients are currently offline"
                 href="/clients"
            />
            <StatCard
                title="Data Throughput"
                value="1.2 Gbps"
                icon={<div className="flex"><ArrowUp className="text-green-400" /><ArrowDown className="text-red-400" /></div>}
                description="Total Upload / Download"
            />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <ActivityChart />
            </div>
            <div className="lg:col-span-1">
                <ClientStatusChart />
            </div>
        </div>
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <DataUsageChart />
            </div>
            <div className="lg:col-span-2">
                <TopSubscribersTable />
            </div>
        </div>
    </div>
  );
}
