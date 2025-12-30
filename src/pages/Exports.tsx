import { useState } from 'react';
import { Globe, TrendingUp, Package, Ship, FileText, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ExportShipment {
    id: string;
    shipmentId: string;
    country: string;
    countryCode: string;
    product: string;
    quantity: number;
    unit: string;
    value: number;
    currency: string;
    status: 'preparing' | 'in_transit' | 'customs' | 'delivered';
    shipDate: string;
    expectedDelivery: string;
    invoiceNumber: string;
    carrier: string;
}

const exportShipments: ExportShipment[] = [
    {
        id: '1',
        shipmentId: 'EXP-2024-001',
        country: 'United States',
        countryCode: 'US',
        product: 'Holographic Glitter Powder (Mix)',
        quantity: 500,
        unit: 'kg',
        value: 45000,
        currency: 'USD',
        status: 'in_transit',
        shipDate: '2024-12-20',
        expectedDelivery: '2025-01-05',
        invoiceNumber: 'INV-EXP-001',
        carrier: 'DHL Express',
    },
    {
        id: '2',
        shipmentId: 'EXP-2024-002',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        product: 'Cosmetic Glitter Powder',
        quantity: 300,
        unit: 'kg',
        value: 28000,
        currency: 'USD',
        status: 'customs',
        shipDate: '2024-12-22',
        expectedDelivery: '2024-12-30',
        invoiceNumber: 'INV-EXP-002',
        carrier: 'FedEx',
    },
    {
        id: '3',
        shipmentId: 'EXP-2024-003',
        country: 'Zambia',
        countryCode: 'ZM',
        product: 'Holographic Polyester Films',
        quantity: 200,
        unit: 'rolls',
        value: 15000,
        currency: 'USD',
        status: 'preparing',
        shipDate: '2024-12-28',
        expectedDelivery: '2025-01-12',
        invoiceNumber: 'INV-EXP-003',
        carrier: 'DHL Express',
    },
    {
        id: '4',
        shipmentId: 'EXP-2024-004',
        country: 'Qatar',
        countryCode: 'QA',
        product: 'Neon Fluorescent Glitter',
        quantity: 150,
        unit: 'kg',
        value: 12500,
        currency: 'USD',
        status: 'delivered',
        shipDate: '2024-12-10',
        expectedDelivery: '2024-12-20',
        invoiceNumber: 'INV-EXP-004',
        carrier: 'Aramex',
    },
    {
        id: '5',
        shipmentId: 'EXP-2024-005',
        country: 'Bahrain',
        countryCode: 'BH',
        product: 'Metallized Holographic Film',
        quantity: 180,
        unit: 'rolls',
        value: 18000,
        currency: 'USD',
        status: 'delivered',
        shipDate: '2024-12-05',
        expectedDelivery: '2024-12-18',
        invoiceNumber: 'INV-EXP-005',
        carrier: 'FedEx',
    },
];

const statusStyles = {
    preparing: 'status-warning',
    in_transit: 'status-info',
    customs: 'status-warning',
    delivered: 'status-success',
};

const countryFlags: Record<string, string> = {
    US: '🇺🇸',
    AE: '🇦🇪',
    ZM: '🇿🇲',
    QA: '🇶🇦',
    BH: '🇧🇭',
};

export default function Exports() {
    const { t } = useLanguage();
    const { isMobile } = useResponsive();
    const [selectedTab, setSelectedTab] = useState('all');

    const formatCurrency = (value: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const totalExportValue = exportShipments.reduce((sum, shipment) => sum + shipment.value, 0);
    const activeShipments = exportShipments.filter(s => s.status === 'in_transit' || s.status === 'customs').length;
    const countriesServed = [...new Set(exportShipments.map(s => s.country))].length;

    // Group by country for analytics
    const countryData = exportShipments.reduce((acc, shipment) => {
        if (!acc[shipment.country]) {
            acc[shipment.country] = { value: 0, count: 0, code: shipment.countryCode };
        }
        acc[shipment.country].value += shipment.value;
        acc[shipment.country].count += 1;
        return acc;
    }, {} as Record<string, { value: number; count: number; code: string }>);

    const ShipmentCard = ({ shipment }: { shipment: ExportShipment }) => (
        <div className="glass-card p-4 space-y-3 animate-fade-in hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">{countryFlags[shipment.countryCode]}</div>
                    <div>
                        <h4 className="font-semibold text-sm">{shipment.shipmentId}</h4>
                        <p className="text-xs text-muted-foreground">{shipment.country}</p>
                    </div>
                </div>
                <span className={cn('status-pill text-[10px]', statusStyles[shipment.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t(shipment.status)}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('product')}</span>
                    <span className="font-medium text-right">{shipment.product}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('quantity')}</span>
                    <span className="font-mono font-semibold">{shipment.quantity} {shipment.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('value')}</span>
                    <span className="font-bold text-primary">{formatCurrency(shipment.value, shipment.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('carrier')}</span>
                    <span className="font-medium">{shipment.carrier}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">{t('expectedDelivery')}</span>
                    <span>{new Date(shipment.expectedDelivery).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );

    const ShipmentTable = ({ shipments }: { shipments: ExportShipment[] }) => (
        <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="premium-table w-full">
                <thead>
                    <tr className="bg-muted/30">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Shipment ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Delivery</th>
                    </tr>
                </thead>
                <tbody>
                    {shipments.map((shipment, index) => (
                        <tr
                            key={shipment.id}
                            className="border-b border-border/50 hover:bg-muted/30 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <td className="px-4 py-4 text-sm font-mono font-semibold">{shipment.shipmentId}</td>
                            <td className="px-4 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{countryFlags[shipment.countryCode]}</span>
                                    {shipment.country}
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm">{shipment.product}</td>
                            <td className="px-4 py-4 text-sm text-right font-mono">{shipment.quantity} {shipment.unit}</td>
                            <td className="px-4 py-4 text-sm text-right font-semibold text-primary">
                                {formatCurrency(shipment.value, shipment.currency)}
                            </td>
                            <td className="px-4 py-4 text-sm">
                                <span className={cn('status-pill', statusStyles[shipment.status])}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {t(shipment.status)}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                {new Date(shipment.expectedDelivery).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('exportTracking')}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">{t('companyName')}</p>
                </div>
                <Button className="rounded-xl shadow-lg shadow-primary/20 h-9 md:h-10 text-sm">
                    <Plus className="h-4 w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">{t('newShipment')}</span>
                    <span className="sm:hidden">{t('add')}</span>
                </Button>
            </div>

            {/* Export Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5">
                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-primary/10 text-primary rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('totalExportValue')}</p>
                        <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalExportValue)}</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] rounded-xl">
                        <Ship className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('activeShipments')}</p>
                        <p className="text-xl md:text-2xl font-bold">{activeShipments}</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] rounded-xl">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('countriesServed')}</p>
                        <p className="text-xl md:text-2xl font-bold">{countriesServed}</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] rounded-xl">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('totalShipments')}</p>
                        <p className="text-xl md:text-2xl font-bold">{exportShipments.length}</p>
                    </div>
                </div>
            </div>

            {/* Country-wise Analytics */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-5">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="text-base md:text-lg font-semibold">{t('countryWiseDistribution')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                    {Object.entries(countryData)
                        .sort((a, b) => b[1].value - a[1].value)
                        .map(([country, data]) => (
                            <div key={country} className="glass-card p-4 space-y-2 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl">{countryFlags[data.code]}</span>
                                    <span className="text-xs font-medium text-muted-foreground">{data.count} shipments</span>
                                </div>
                                <p className="text-sm font-semibold">{country}</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(data.value)}</p>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                        style={{ width: `${(data.value / totalExportValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Shipments List */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-5">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-base md:text-lg font-semibold">{t('exportShipments')}</h3>
                    </div>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                    <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto grid grid-cols-4">
                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                            {t('all')}
                        </TabsTrigger>
                        <TabsTrigger value="in_transit" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                            {t('inTransit')}
                        </TabsTrigger>
                        <TabsTrigger value="customs" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                            {t('customs')}
                        </TabsTrigger>
                        <TabsTrigger value="delivered" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                            {t('delivered')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="animate-fade-in">
                        {isMobile ? (
                            <div className="space-y-3">
                                {exportShipments.map((shipment) => (
                                    <ShipmentCard key={shipment.id} shipment={shipment} />
                                ))}
                            </div>
                        ) : (
                            <ShipmentTable shipments={exportShipments} />
                        )}
                    </TabsContent>

                    {['in_transit', 'customs', 'delivered'].map((status) => (
                        <TabsContent key={status} value={status} className="animate-fade-in">
                            {isMobile ? (
                                <div className="space-y-3">
                                    {exportShipments
                                        .filter((s) => s.status === status)
                                        .map((shipment) => (
                                            <ShipmentCard key={shipment.id} shipment={shipment} />
                                        ))}
                                </div>
                            ) : (
                                <ShipmentTable shipments={exportShipments.filter((s) => s.status === status)} />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
