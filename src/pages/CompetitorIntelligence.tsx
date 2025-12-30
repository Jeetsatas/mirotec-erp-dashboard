import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Search, RefreshCw, BarChart3, Target, Award, Bell, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:3001';

interface CompetitorData {
    id: string;
    name: string;
    location: string;
    products: string[];
    avgPrice: number;
    marketShare: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    rating: number;
    responseTime: string;
    lastScraped: string;
    source: 'IndiaMART' | 'TradeIndia' | 'ExportersIndia' | 'Alibaba';
    priceHistory: { month: string; price: number }[];
}

interface ProductComparison {
    product: string;
    mirotecPrice: number;
    competitors: { name: string; price: number; difference: number }[];
    marketAvg: number;
    recommendation: 'increase' | 'decrease' | 'maintain';
}

interface MarketAlert {
    id: string;
    type: 'price_drop' | 'price_increase' | 'new_competitor' | 'market_trend';
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    actionRequired: boolean;
}

// Static data removed - now using real-time API data
// This data was replaced with live backend API calls
/* const competitorData: CompetitorData[] = [
    ... static data removed ...
]; */

const productComparisons: ProductComparison[] = [
    {
        product: 'Holographic Glitter Powder (1kg)',
        mirotecPrice: 850,
        competitors: [
            { name: 'Sparkle Industries', price: 850, difference: 0 },
            { name: 'Rainbow Glitters', price: 780, difference: -8.2 },
            { name: 'Golden Shimmer', price: 920, difference: 8.2 },
        ],
        marketAvg: 850,
        recommendation: 'maintain',
    },
    {
        product: 'Cosmetic Glitter (500g)',
        mirotecPrice: 950,
        competitors: [
            { name: 'Crystal Glitz', price: 1050, difference: 10.5 },
            { name: 'Sparkle Industries', price: 880, difference: -7.4 },
            { name: 'Rainbow Glitters', price: 820, difference: -13.7 },
        ],
        marketAvg: 916,
        recommendation: 'increase',
    },
    {
        product: 'Neon Fluorescent Glitter (1kg)',
        mirotecPrice: 1100,
        competitors: [
            { name: 'Rainbow Glitters', price: 950, difference: -13.6 },
            { name: 'Glitter World', price: 880, difference: -20.0 },
            { name: 'Golden Shimmer', price: 1050, difference: -4.5 },
        ],
        marketAvg: 960,
        recommendation: 'decrease',
    },
    {
        product: 'Holographic Polyester Film (Roll)',
        mirotecPrice: 2500,
        competitors: [
            { name: 'Golden Shimmer', price: 2800, difference: 12.0 },
            { name: 'Crystal Glitz', price: 2650, difference: 6.0 },
            { name: 'Sparkle Industries', price: 2400, difference: -4.0 },
        ],
        marketAvg: 2616,
        recommendation: 'increase',
    },
];

const marketAlerts: MarketAlert[] = [
    {
        id: '1',
        type: 'price_drop',
        title: 'Rainbow Glitters dropped Neon Glitter price by 15%',
        description: 'Competitor reduced price from ₹1,120 to ₹950/kg. This may impact our sales in Gujarat region.',
        severity: 'high',
        timestamp: '2024-12-28T14:30:00',
        actionRequired: true,
    },
    {
        id: '2',
        type: 'new_competitor',
        title: 'New competitor entered market: "Shine Bright Glitters"',
        description: 'Pune-based company started selling on IndiaMART with aggressive pricing (20% below market avg).',
        severity: 'medium',
        timestamp: '2024-12-27T10:15:00',
        actionRequired: true,
    },
    {
        id: '3',
        type: 'market_trend',
        title: 'Cosmetic glitter demand up 35% in December',
        description: 'Festive season driving high demand. Competitors increased prices by 5-8%. Good opportunity to optimize pricing.',
        severity: 'medium',
        timestamp: '2024-12-26T16:45:00',
        actionRequired: false,
    },
    {
        id: '4',
        type: 'price_increase',
        title: 'Crystal Glitz increased premium glitter prices',
        description: 'Premium segment prices increased by 10%. Market accepting higher prices for quality products.',
        severity: 'low',
        timestamp: '2024-12-25T09:20:00',
        actionRequired: false,
    },
];

const trendColors = {
    up: 'text-red-500',
    down: 'text-green-500',
    stable: 'text-muted-foreground',
};

const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: () => <div className="h-4 w-4 border-t-2 border-muted-foreground" />,
};

const alertStyles = {
    high: 'border-l-4 border-red-500 bg-red-500/5',
    medium: 'border-l-4 border-amber-500 bg-amber-500/5',
    low: 'border-l-4 border-blue-500 bg-blue-500/5',
};

export default function CompetitorIntelligence() {
    const { t } = useLanguage();
    const { isMobile } = useResponsive();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    // Real-time data state
    const [competitorData, setCompetitorData] = useState<CompetitorData[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiLastScraped, setApiLastScraped] = useState<string | null>(null);

    // Demo data fallback for when API is not available
    const getDemoCompetitors = (): CompetitorData[] => [
        {
            id: 'demo-1',
            name: 'Sparkle Industries',
            location: 'Mumbai, Maharashtra',
            products: ['Holographic Glitter', 'Metallic Glitter', 'Cosmetic Glitter'],
            avgPrice: 950,
            marketShare: 18.5,
            trend: 'up' as const,
            trendValue: 5.2,
            rating: 4.5,
            responseTime: '2-4 hours',
            lastScraped: new Date().toISOString(),
            source: 'IndiaMART' as const,
            priceHistory: [
                { month: 'Aug', price: 900 },
                { month: 'Sep', price: 920 },
                { month: 'Oct', price: 935 },
                { month: 'Nov', price: 945 },
                { month: 'Dec', price: 950 }
            ]
        },
        {
            id: 'demo-2',
            name: 'Rainbow Exports',
            location: 'Surat, Gujarat',
            products: ['Polyester Glitter', 'Iridescent Glitter'],
            avgPrice: 820,
            marketShare: 15.2,
            trend: 'stable' as const,
            trendValue: 0.5,
            rating: 4.3,
            responseTime: '4-6 hours',
            lastScraped: new Date().toISOString(),
            source: 'TradeIndia' as const,
            priceHistory: [
                { month: 'Aug', price: 815 },
                { month: 'Sep', price: 820 },
                { month: 'Oct', price: 818 },
                { month: 'Nov', price: 822 },
                { month: 'Dec', price: 820 }
            ]
        },
        {
            id: 'demo-3',
            name: 'Golden Glitters Pvt Ltd',
            location: 'Delhi NCR',
            products: ['Neon Fluorescent Glitter', 'Art & Craft Glitter'],
            avgPrice: 1050,
            marketShare: 12.8,
            trend: 'down' as const,
            trendValue: -3.1,
            rating: 4.7,
            responseTime: '1-2 hours',
            lastScraped: new Date().toISOString(),
            source: 'IndiaMART' as const,
            priceHistory: [
                { month: 'Aug', price: 1100 },
                { month: 'Sep', price: 1085 },
                { month: 'Oct', price: 1070 },
                { month: 'Nov', price: 1060 },
                { month: 'Dec', price: 1050 }
            ]
        },
        {
            id: 'demo-4',
            name: 'Crystal Shine Exports',
            location: 'Ahmedabad, Gujarat',
            products: ['Holographic Films', 'Industrial Glitter'],
            avgPrice: 890,
            marketShare: 14.3,
            trend: 'up' as const,
            trendValue: 2.8,
            rating: 4.4,
            responseTime: '3-5 hours',
            lastScraped: new Date().toISOString(),
            source: 'ExportersIndia' as const,
            priceHistory: [
                { month: 'Aug', price: 865 },
                { month: 'Sep', price: 875 },
                { month: 'Oct', price: 880 },
                { month: 'Nov', price: 885 },
                { month: 'Dec', price: 890 }
            ]
        },
        {
            id: 'demo-5',
            name: 'Premium Glitter Co.',
            location: 'Bangalore, Karnataka',
            products: ['Bio Glitter', 'Cosmetic Grade Glitter'],
            avgPrice: 1150,
            marketShare: 11.5,
            trend: 'up' as const,
            trendValue: 4.5,
            rating: 4.8,
            responseTime: '1-3 hours',
            lastScraped: new Date().toISOString(),
            source: 'IndiaMART' as const,
            priceHistory: [
                { month: 'Aug', price: 1100 },
                { month: 'Sep', price: 1115 },
                { month: 'Oct', price: 1130 },
                { month: 'Nov', price: 1142 },
                { month: 'Dec', price: 1150 }
            ]
        }
    ];

    // Fetch competitors from API
    const fetchCompetitors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/competitors`, {
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            const data = await response.json();

            if (data.success && data.data) {
                // Transform API data to match our interface
                const transformed = data.data.map((comp: any) => ({
                    ...comp,
                    products: Array.isArray(comp.products)
                        ? comp.products.map((p: any) => typeof p === 'string' ? p : p.name)
                        : [],
                    priceHistory: comp.priceHistory || []
                }));

                setCompetitorData(transformed);
                setApiLastScraped(data.lastScraped);
                setLastUpdated(new Date().toLocaleTimeString());

                console.log(`✅ Loaded ${transformed.length} competitors from API`);
            }
        } catch (error) {
            console.error('Failed to fetch competitors:', error);

            // Load demo data as fallback
            const demoData = getDemoCompetitors();
            setCompetitorData(demoData);
            setLastUpdated(new Date().toLocaleTimeString());

            toast({
                title: "Using Demo Data",
                description: "Backend API unavailable. Showing demo competitors for preview.",
                variant: "default"
            });

            console.log(`ℹ️ Loaded ${demoData.length} demo competitors (fallback)`);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on component mount
    useEffect(() => {
        fetchCompetitors();
    }, []);

    const filteredCompetitors = competitorData.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Trigger manual scrape
            const response = await fetch(`${API_BASE_URL}/api/scrape/manual`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                // Fetch updated data
                await fetchCompetitors();
                toast({
                    title: "✅ Data Refreshed",
                    description: `Found ${data.count} competitors from live sources.`
                });
            }
        } catch (error) {
            toast({
                title: "Refresh Failed",
                description: "Could not refresh data. Try again later.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const CompetitorCard = ({ competitor }: { competitor: CompetitorData }) => {
        const TrendIcon = trendIcons[competitor.trend];
        return (
            <div className="glass-card p-4 space-y-3 animate-fade-in hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{competitor.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {competitor.source}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{competitor.location}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <TrendIcon className={cn('h-4 w-4', trendColors[competitor.trend])} />
                        <span className={trendColors[competitor.trend]}>
                            {competitor.trend !== 'stable' && `${Math.abs(competitor.trendValue)}%`}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p className="text-muted-foreground">Avg Price</p>
                        <p className="font-bold text-lg">₹{competitor.avgPrice}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Market Share</p>
                        <p className="font-bold text-lg">{competitor.marketShare}%</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-semibold flex items-center gap-1">
                            ⭐ {competitor.rating}/5
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Response</p>
                        <p className="font-semibold">{competitor.responseTime}</p>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Products:</p>
                    <div className="flex flex-wrap gap-1">
                        {competitor.products.map((product, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary">
                                {product}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] text-muted-foreground text-right">
                    Updated: {new Date(competitor.lastScraped).toLocaleString()}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('competitorIntelligence')}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">{t('companyName')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-9"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('refresh')}
                    </Button>
                </div>
            </div>

            {/* Market Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-primary/10 text-primary rounded-xl">
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('competitors')}</p>
                        <p className="text-xl md:text-2xl font-bold">{competitorData.length}</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] rounded-xl">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('marketPosition')}</p>
                        <p className="text-xl md:text-2xl font-bold">#2</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] rounded-xl">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('ourMarketShare')}</p>
                        <p className="text-xl md:text-2xl font-bold">20.8%</p>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5 flex items-center gap-4">
                    <div className="icon-container h-12 w-12 bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] rounded-xl">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">{t('activeAlerts')}</p>
                        <p className="text-xl md:text-2xl font-bold">{marketAlerts.filter(a => a.actionRequired).length}</p>
                    </div>
                </div>
            </div>

            {/* Market Alerts */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-5">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-base md:text-lg font-semibold">{t('marketAlerts')}</h3>
                </div>
                <div className="space-y-3">
                    {marketAlerts.map((alert) => (
                        <div key={alert.id} className={cn('glass-card p-4 space-y-2', alertStyles[alert.severity])}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                                        {alert.actionRequired && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">
                                                Action Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                                </div>
                                <span className={cn('text-[10px] px-2 py-1 rounded-md font-medium', {
                                    'bg-red-500/20 text-red-700': alert.severity === 'high',
                                    'bg-amber-500/20 text-amber-700': alert.severity === 'medium',
                                    'bg-blue-500/20 text-blue-700': alert.severity === 'low',
                                })}>
                                    {alert.severity.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="competitors" className="space-y-4 md:space-y-5">
                <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto grid grid-cols-2">
                    <TabsTrigger value="competitors" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                        {t('competitors')}
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:shadow-sm text-sm">
                        {t('priceComparison')}
                    </TabsTrigger>
                </TabsList>

                {/* Competitors Tab */}
                <TabsContent value="competitors" className="animate-fade-in space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('searchCompetitors')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCompetitors.map((competitor) => (
                            <CompetitorCard key={competitor.id} competitor={competitor} />
                        ))}
                    </div>
                </TabsContent>

                {/* Price Comparison Tab */}
                <TabsContent value="pricing" className="animate-fade-in">
                    <div className="glass-card p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-5">{t('productPriceComparison')}</h3>
                        <div className="space-y-6">
                            {productComparisons.map((comparison, idx) => (
                                <div key={idx} className="glass-card p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-sm">{comparison.product}</h4>
                                        <span className={cn('text-xs px-3 py-1 rounded-full font-medium', {
                                            'bg-green-500/20 text-green-700': comparison.recommendation === 'increase',
                                            'bg-red-500/20 text-red-700': comparison.recommendation === 'decrease',
                                            'bg-blue-500/20 text-blue-700': comparison.recommendation === 'maintain',
                                        })}>
                                            {comparison.recommendation === 'increase' && '📈 Increase Price'}
                                            {comparison.recommendation === 'decrease' && '📉 Decrease Price'}
                                            {comparison.recommendation === 'maintain' && '✓ Maintain Price'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                            <p className="text-muted-foreground mb-1">Mirotec Price</p>
                                            <p className="font-bold text-lg text-primary">₹{comparison.mirotecPrice}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background">
                                            <p className="text-muted-foreground mb-1">Market Avg</p>
                                            <p className="font-bold text-lg">₹{comparison.marketAvg}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background">
                                            <p className="text-muted-foreground mb-1">Lowest</p>
                                            <p className="font-bold text-lg text-green-600">
                                                ₹{Math.min(...comparison.competitors.map(c => c.price))}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background">
                                            <p className="text-muted-foreground mb-1">Highest</p>
                                            <p className="font-bold text-lg text-red-600">
                                                ₹{Math.max(...comparison.competitors.map(c => c.price))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Competitor Prices:</p>
                                        {comparison.competitors.map((comp, cIdx) => (
                                            <div key={cIdx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/50">
                                                <span className="font-medium">{comp.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">₹{comp.price}</span>
                                                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', {
                                                        'bg-green-500/20 text-green-700': comp.difference < 0,
                                                        'bg-red-500/20 text-red-700': comp.difference > 0,
                                                        'bg-muted text-muted-foreground': comp.difference === 0,
                                                    })}>
                                                        {comp.difference > 0 ? '+' : ''}{comp.difference.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
