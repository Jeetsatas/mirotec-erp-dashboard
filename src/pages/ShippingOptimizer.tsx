import { useState } from 'react';
import { Package, TrendingDown, Calculator, Shield, Truck, DollarSign, MapPin, Clock, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ShipmentDetails {
    weight: number;
    length: number;
    width: number;
    height: number;
    destination: string;
    value: number;
    insurance: boolean;
}

interface CarrierQuote {
    carrier: string;
    logo: string;
    price: number;
    currency: string;
    transitDays: string;
    insurance: number;
    fuel_surcharge: number;
    totalCost: number;
    savings: number;
    savingsPercent: number;
    features: string[];
    rating: number;
    trackingIncluded: boolean;
    recommended: boolean;
}

const DESTINATIONS = [
    { value: 'US', label: 'USA - United States', flag: '🇺🇸' },
    { value: 'AE', label: 'UAE - Dubai', flag: '🇦🇪' },
    { value: 'QA', label: 'Qatar - Doha', flag: '🇶🇦' },
    { value: 'BH', label: 'Bahrain - Manama', flag: '🇧🇭' },
    { value: 'ZM', label: 'Zambia - Lusaka', flag: '🇿🇲' },
];

// Simulated AI rate calculator
const calculateCarrierRates = (details: ShipmentDetails): CarrierQuote[] => {
    const { weight, destination, value, insurance } = details;

    // Base rates per kg for different carriers (simulated)
    const baseRates: Record<string, number> = {
        'DHL Express': destination === 'US' ? 850 : destination === 'AE' ? 650 : 750,
        'FedEx International': destination === 'US' ? 820 : destination === 'AE' ? 680 : 770,
        'Aramex': destination === 'US' ? 750 : destination === 'AE' ? 580 : 680,
        'Blue Dart': destination === 'US' ? 900 : destination === 'AE' ? 720 : 800,
        'UPS Worldwide': destination === 'US' ? 840 : destination === 'AE' ? 670 : 760,
    };

    const carriers: CarrierQuote[] = [];

    Object.entries(baseRates).forEach(([carrier, baseRate]) => {
        const basePrice = baseRate * weight;
        const fuelSurcharge = basePrice * 0.15; // 15% fuel surcharge
        const insuranceCost = insurance ? value * 0.02 : 0; // 2% of declared value

        // Bulk discount: 5% discount for >10kg, 10% for >25kg
        let bulkDiscount = 0;
        if (weight > 25) bulkDiscount = 0.10;
        else if (weight > 10) bulkDiscount = 0.05;

        const discountAmount = basePrice * bulkDiscount;
        const totalCost = basePrice + fuelSurcharge + insuranceCost - discountAmount;

        // Find most expensive for savings calculation
        const maxPrice = Math.max(...Object.values(baseRates)) * weight * 1.15;
        const savings = maxPrice - totalCost;
        const savingsPercent = (savings / maxPrice) * 100;

        carriers.push({
            carrier,
            logo: carrier.split(' ')[0].toLowerCase(),
            price: basePrice,
            currency: '₹',
            transitDays: carrier === 'DHL Express' ? '2-3' : carrier === 'FedEx International' ? '3-4' : carrier === 'Aramex' ? '4-5' : carrier === 'Blue Dart' ? '3-4' : '3-5',
            insurance: insuranceCost,
            fuel_surcharge: fuelSurcharge,
            totalCost: Math.round(totalCost),
            savings: Math.round(savings),
            savingsPercent: parseFloat(savingsPercent.toFixed(1)),
            features: [
                bulkDiscount > 0 ? `${bulkDiscount * 100}% Bulk Discount` : 'Standard Rate',
                'Real-time Tracking',
                carrier === 'DHL Express' || carrier === 'FedEx International' ? 'Priority Handling' : 'Standard Handling',
                insurance ? 'Insurance Included' : 'Insurance Optional'
            ],
            rating: carrier === 'DHL Express' ? 4.8 : carrier === 'FedEx International' ? 4.7 : carrier === 'Aramex' ? 4.5 : carrier === 'Blue Dart' ? 4.6 : 4.4,
            trackingIncluded: true,
            recommended: false
        });
    });

    // Sort by total cost (cheapest first)
    carriers.sort((a, b) => a.totalCost - b.totalCost);

    // Mark cheapest as recommended
    if (carriers.length > 0) {
        carriers[0].recommended = true;
    }

    return carriers;
};

export default function ShippingOptimizer() {
    const { t } = useLanguage();
    const { isMobile } = useResponsive();

    const [shipment, setShipment] = useState<ShipmentDetails>({
        weight: 15,
        length: 40,
        width: 30,
        height: 25,
        destination: 'US',
        value: 50000,
        insurance: true,
    });

    const [quotes, setQuotes] = useState<CarrierQuote[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleCalculate = () => {
        const calculatedQuotes = calculateCarrierRates(shipment);
        setQuotes(calculatedQuotes);
        setShowResults(true);
    };

    const totalSavings = quotes.length > 0 ? quotes[0].savings : 0;
    const annualSavings = totalSavings * 50; // Assuming 50 shipments per year

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('shippingOptimizer')}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5 md:mt-1">
                        AI-Powered International Shipping Cost Comparison
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">Save 15-20% on shipping costs</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="glass-card p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="icon-container h-10 w-10 bg-primary/10 text-primary rounded-xl">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('carriers')}</p>
                            <p className="text-lg md:text-xl font-bold">5</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="icon-container h-10 w-10 bg-green-500/10 text-green-500 rounded-xl">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('avgSavings')}</p>
                            <p className="text-lg md:text-xl font-bold">18%</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="icon-container h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('fastestDelivery')}</p>
                            <p className="text-lg md:text-xl font-bold">2-3d</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="icon-container h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl">
                            <Award className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('topRated')}</p>
                            <p className="text-lg md:text-xl font-bold">DHL</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipment Calculator */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3 className="text-base md:text-lg font-semibold">{t('calculateShippingCost')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Weight */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('weight')} (kg)</label>
                        <Input
                            type="number"
                            value={shipment.weight}
                            onChange={(e) => setShipment({ ...shipment, weight: parseFloat(e.target.value) || 0 })}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Dimensions */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('dimensions')} (cm)</label>
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                type="number"
                                placeholder="L"
                                value={shipment.length}
                                onChange={(e) => setShipment({ ...shipment, length: parseFloat(e.target.value) || 0 })}
                                className="rounded-xl"
                            />
                            <Input
                                type="number"
                                placeholder="W"
                                value={shipment.width}
                                onChange={(e) => setShipment({ ...shipment, width: parseFloat(e.target.value) || 0 })}
                                className="rounded-xl"
                            />
                            <Input
                                type="number"
                                placeholder="H"
                                value={shipment.height}
                                onChange={(e) => setShipment({ ...shipment, height: parseFloat(e.target.value) || 0 })}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('destination')}</label>
                        <Select value={shipment.destination} onValueChange={(value) => setShipment({ ...shipment, destination: value })}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DESTINATIONS.map((dest) => (
                                    <SelectItem key={dest.value} value={dest.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{dest.flag}</span>
                                            <span>{dest.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Declared Value */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">{t('declaredValue')} (₹)</label>
                        <Input
                            type="number"
                            value={shipment.value}
                            onChange={(e) => setShipment({ ...shipment, value: parseFloat(e.target.value) || 0 })}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Insurance */}
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={shipment.insurance}
                                onChange={(e) => setShipment({ ...shipment, insurance: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm font-medium">{t('includeInsurance')}</span>
                        </label>
                    </div>
                </div>

                <Button onClick={handleCalculate} className="w-full md:w-auto rounded-xl">
                    <Calculator className="h-4 w-4 mr-2" />
                    {t('compareRates')}
                </Button>
            </div>

            {/* Results */}
            {showResults && quotes.length > 0 && (
                <div className="space-y-4">
                    {/* Savings Summary */}
                    <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                                    💰 Best Rate Found!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Using <span className="font-semibold">{quotes[0].carrier}</span> saves you{' '}
                                    <span className="font-bold">₹{totalSavings.toLocaleString()}</span> per shipment
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Annual Savings (50 shipments)</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₹{annualSavings.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Carrier Quotes */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('carrierQuotes')}</h3>
                        <div className="space-y-3">
                            {quotes.map((quote, index) => (
                                <div
                                    key={quote.carrier}
                                    className={cn(
                                        'glass-card p-4 md:p-5 transition-all hover:shadow-lg',
                                        quote.recommended && 'border-2 border-green-500 relative'
                                    )}
                                >
                                    {quote.recommended && (
                                        <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                            ⭐ {t('recommended')}
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        {/* Carrier Info */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-lg border">
                                                    {quote.logo.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-base">{quote.carrier}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <span>⭐ {quote.rating}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {quote.transitDays} days
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-2">
                                                {quote.features.map((feature, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className="text-right">
                                            <div className="space-y-1 mb-3">
                                                <div className="text-xs text-muted-foreground flex justify-between gap-4">
                                                    <span>{t('baseRate')}:</span>
                                                    <span>₹{quote.price.toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex justify-between gap-4">
                                                    <span>{t('fuelSurcharge')}:</span>
                                                    <span>₹{quote.fuel_surcharge.toLocaleString()}</span>
                                                </div>
                                                {quote.insurance > 0 && (
                                                    <div className="text-xs text-muted-foreground flex justify-between gap-4">
                                                        <span>{t('insurance')}:</span>
                                                        <span>₹{quote.insurance.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2 justify-end">
                                                <p className="text-2xl md:text-3xl font-bold">
                                                    ₹{quote.totalCost.toLocaleString()}
                                                </p>
                                            </div>

                                            {quote.savings > 0 && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    {t('save')} ₹{quote.savings.toLocaleString()} ({quote.savingsPercent}%)
                                                </p>
                                            )}

                                            <Button
                                                className="mt-3 rounded-xl w-full md:w-auto"
                                                variant={quote.recommended ? "default" : "outline"}
                                            >
                                                {t('selectCarrier')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
