/**
 * Demo/Fallback Data Generator
 * Generates realistic competitor data when live scraping fails
 */

const INDIAN_CITIES = [
    'Mumbai, Maharashtra',
    'Surat, Gujarat',
    'Delhi NCR',
    'Bangalore, Karnataka',
    'Chennai, Tamil Nadu',
    'Ahmedabad, Gujarat',
    'Pune, Maharashtra',
    'Valsad, Gujarat',
    'Hyderabad, Telangana',
    'Kolkata, West Bengal'
];

const COMPANY_PREFIXES = [
    'Sparkle', 'Rainbow', 'Golden', 'Crystal', 'Glitter',
    'Shine', 'Shimmer', 'Brilliant', 'Premium', 'Metro',
    'Elite', 'Royal', 'Supreme', 'Perfect', 'Star'
];

const COMPANY_SUFFIXES = [
    'Industries', 'Enterprises', 'Corporation', 'Exports',
    'International', 'Pvt Ltd', 'Co.', 'Traders', 'Suppliers',
    'Manufacturing', 'Glitters', 'Products'
];

const PRODUCT_TYPES = [
    'Holographic Glitter Powder',
    'Cosmetic Glitter',
    'Polyester Glitter',
    'Neon Fluorescent Glitter',
    'Metallic Glitter',
    'Art & Craft Glitter',
    'Industrial Glitter',
    'Holographic Films',
    'Iridescent Glitter',
    'Bio Glitter'
];

const SOURCES = ['IndiaMART', 'TradeIndia', 'ExportersIndia'];

function generateCompanyName() {
    const prefix = COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)];
    const suffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
    return `${prefix} ${suffix}`;
}

function generateProducts() {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 products
    const products = [];
    const shuffled = [...PRODUCT_TYPES].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
        products.push({
            name: shuffled[i],
            price: Math.round(700 + Math.random() * 600), // ₹700-1300
            unit: 'kg'
        });
    }

    return products;
}

function generateResponseTime() {
    const options = [
        '30min-1 hour',
        '1-2 hours',
        '2-4 hours',
        '4-6 hours',
        '6-8 hours',
        'Within 24 hours'
    ];
    return options[Math.floor(Math.random() * options.length)];
}

function generatePriceHistory() {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const basePrice = Math.round(700 + Math.random() * 600);
    const history = [];

    let price = basePrice;
    for (const month of months) {
        // Random fluctuation ±5%
        price = Math.round(price * (0.95 + Math.random() * 0.1));
        history.push({ month, price });
    }

    return history;
}

export function generateDemoCompetitors(count = 12) {
    console.log(`📊 Generating ${count} demo competitors (fallback data)...`);

    const competitors = [];
    const usedNames = new Set();

    for (let i = 0; i < count; i++) {
        let name;
        do {
            name = generateCompanyName();
        } while (usedNames.has(name));
        usedNames.add(name);

        const products = generateProducts();
        const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length);
        const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

        const competitor = {
            id: `demo-${source.toLowerCase()}-${Date.now()}-${i}`,
            name: name,
            location: INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)],
            source: source,
            products: products,
            avgPrice: avgPrice,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            responseTime: generateResponseTime(),
            marketShare: parseFloat((5 + Math.random() * 20).toFixed(1)),
            trend: Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'stable'),
            trendValue: parseFloat((Math.random() * 6 - 3).toFixed(1)),
            priceHistory: generatePriceHistory(),
            lastScraped: new Date().toISOString(),
            _isDemoData: true // Flag to indicate this is fallback data
        };

        competitors.push(competitor);
    }

    console.log(`  ✅ Generated ${competitors.length} realistic demo competitors`);
    return competitors;
}
