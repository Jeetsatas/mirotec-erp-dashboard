/**
 * Real-Time Shipping Rate Fetcher
 * Simulates API calls to DHL, FedEx, Aramex, Blue Dart, UPS
 * In production, replace with actual carrier API integrations
 */

// Cache duration: 5 minutes (rates update frequently)
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Simulated carrier API base rates (per kg)
const CARRIER_BASE_RATES = {
    'DHL Express': {
        US: { min: 820, max: 880, avgTransit: '2-3' },
        AE: { min: 630, max: 670, avgTransit: '2-3' },
        QA: { min: 640, max: 680, avgTransit: '2-3' },
        BH: { min: 635, max: 675, avgTransit: '2-3' },
        ZM: { min: 730, max: 770, avgTransit: '3-4' },
    },
    'FedEx International': {
        US: { min: 800, max: 840, avgTransit: '3-4' },
        AE: { min: 660, max: 700, avgTransit: '2-3' },
        QA: { min: 670, max: 710, avgTransit: '3-4' },
        BH: { min: 665, max: 705, avgTransit: '3-4' },
        ZM: { min: 750, max: 790, avgTransit: '4-5' },
    },
    'Aramex': {
        US: { min: 730, max: 770, avgTransit: '4-5' },
        AE: { min: 560, max: 600, avgTransit: '3-4' },
        QA: { min: 570, max: 610, avgTransit: '3-4' },
        BH: { min: 565, max: 605, avgTransit: '3-4' },
        ZM: { min: 660, max: 700, avgTransit: '5-6' },
    },
    'Blue Dart': {
        US: { min: 880, max: 920, avgTransit: '3-4' },
        AE: { min: 700, max: 740, avgTransit: '3-4' },
        QA: { min: 710, max: 750, avgTransit: '3-4' },
        BH: { min: 705, max: 745, avgTransit: '3-4' },
        ZM: { min: 780, max: 820, avgTransit: '4-5' },
    },
    'UPS Worldwide': {
        US: { min: 820, max: 860, avgTransit: '3-5' },
        AE: { min: 650, max: 690, avgTransit: '3-4' },
        QA: { min: 660, max: 700, avgTransit: '3-5' },
        BH: { min: 655, max: 695, avgTransit: '3-5' },
        ZM: { min: 740, max: 780, avgTransit: '4-6' },
    },
};

const CARRIER_RATINGS = {
    'DHL Express': 4.8,
    'FedEx International': 4.7,
    'Aramex': 4.5,
    'Blue Dart': 4.6,
    'UPS Worldwide': 4.4,
};

// Simulate API call delay (realistic network latency)
const simulateAPIDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

/**
 * Fetch real-time rate from carrier API
 * In production: Replace with actual API calls
 */
async function fetchCarrierRate(carrier, destination, weight, value, insurance) {
    // Simulate API call delay
    await simulateAPIDelay();

    const rateConfig = CARRIER_BASE_RATES[carrier][destination];

    // Add realistic variation (±3%) to simulate real-time rate fluctuations
    const variation = 0.97 + (Math.random() * 0.06); // 0.97 to 1.03
    const baseRatePerKg = (rateConfig.min + Math.random() * (rateConfig.max - rateConfig.min)) * variation;

    const basePrice = baseRatePerKg * weight;

    // Fuel surcharge varies by carrier and route (12-18%)
    const fuelSurchargeRate = 0.12 + Math.random() * 0.06;
    const fuelSurcharge = basePrice * fuelSurchargeRate;

    // Insurance cost (carriers charge 2-3% of declared value)
    const insuranceRate = 0.02 + Math.random() * 0.01;
    const insuranceCost = insurance ? value * insuranceRate : 0;

    // Bulk discounts
    let bulkDiscount = 0;
    if (weight > 25) bulkDiscount = 0.10; // 10% for >25kg
    else if (weight > 10) bulkDiscount = 0.05; // 5% for >10kg

    const discountAmount = basePrice * bulkDiscount;
    const totalCost = basePrice + fuelSurcharge + insuranceCost - discountAmount;

    return {
        carrier,
        baseRate: Math.round(basePrice),
        fuelSurcharge: Math.round(fuelSurcharge),
        fuelSurchargePercent: (fuelSurchargeRate * 100).toFixed(1),
        insurance: Math.round(insuranceCost),
        bulkDiscount: Math.round(discountAmount),
        bulkDiscountPercent: (bulkDiscount * 100),
        totalCost: Math.round(totalCost),
        transitDays: rateConfig.avgTransit,
        rating: CARRIER_RATINGS[carrier],
        timestamp: new Date().toISOString(),
    };
}

/**
 * Fetch rates from all carriers in parallel
 */
export async function fetchAllCarrierRates(shipmentDetails) {
    const { weight, destination, value, insurance } = shipmentDetails;

    console.log(`🔄 Fetching real-time rates for ${weight}kg shipment to ${destination}...`);
    const startTime = Date.now();

    try {
        // Fetch from all carriers in parallel (faster than sequential)
        const promises = Object.keys(CARRIER_BASE_RATES).map(carrier =>
            fetchCarrierRate(carrier, destination, weight, value, insurance)
        );

        const results = await Promise.all(promises);

        // Calculate savings relative to most expensive
        const maxCost = Math.max(...results.map(r => r.totalCost));

        const quotesWithSavings = results.map(quote => ({
            ...quote,
            savings: maxCost - quote.totalCost,
            savingsPercent: parseFloat(((maxCost - quote.totalCost) / maxCost * 100).toFixed(1)),
            features: [
                quote.bulkDiscountPercent > 0 ? `${quote.bulkDiscountPercent}% Bulk Discount` : 'Standard Rate',
                'Real-time Tracking',
                ['DHL Express', 'FedEx International'].includes(quote.carrier) ? 'Priority Handling' : 'Standard Handling',
                insurance ? 'Insurance Included' : 'Insurance Optional',
            ],
            trackingIncluded: true,
        }));

        // Sort by total cost (cheapest first)
        quotesWithSavings.sort((a, b) => a.totalCost - b.totalCost);

        // Mark cheapest as recommended
        if (quotesWithSavings.length > 0) {
            quotesWithSavings[0].recommended = true;
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Fetched ${results.length} quotes in ${duration}ms`);

        return {
            success: true,
            quotes: quotesWithSavings,
            timestamp: new Date().toISOString(),
            cachedUntil: new Date(Date.now() + CACHE_DURATION_MS).toISOString(),
        };
    } catch (error) {
        console.error('❌ Error fetching carrier rates:', error);
        throw error;
    }
}

/**
 * Get rate for specific carrier
 */
export async function fetchSingleCarrierRate(carrier, shipmentDetails) {
    const { weight, destination, value, insurance } = shipmentDetails;

    try {
        const quote = await fetchCarrierRate(carrier, destination, weight, value, insurance);

        return {
            success: true,
            quote,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`❌ Error fetching rate from ${carrier}:`, error);
        throw error;
    }
}
