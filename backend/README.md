# 🕷️ Mirotec ERP - Real-Time Competitor Intelligence Scraper

## 🎯 What This Does

This backend service **scrapes real competitor data** from:
- ✅ **IndiaMART** - India's largest B2B marketplace
- ✅ **TradeIndia** - Major B2B platform
- ✅ **ExportersIndia** - International exporter directory

**Extracted Data:**
- Competitor company names
- Location/city
- Product prices (glitter powder, holographic films)
- Ratings and reviews
- Response times
- Last updated timestamps

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web server
- `puppeteer` - Headless browser for dynamic scraping
- `cheerio` - HTML parsing
- `axios` - HTTP requests
- `node-cron` - Scheduled tasks
- `cors` - Cross-origin requests

### 2. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server starts on: **http://localhost:3001**

---

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "lastScraped": "2024-12-29T09:30:00.000Z",
  "competitorsTracked": 12,
  "uptime": 3600
}
```

### Get All Competitors
```bash
GET http://localhost:3001/api/competitors
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "indiamart-123",
      "name": "Sparkle Industries",
      "location": "Mumbai, Maharashtra",
      "source": "IndiaMART",
      "products": [
        {
          "name": "glitter powder",
          "price": 850,
          "unit": "kg"
        }
      ],
      "avgPrice": 850,
      "rating": 4.3,
      "responseTime": "2-4 hours",
      "marketShare": 18.5,
      "trend": "up",
      "trendValue": 3.2,
      "lastScraped": "2024-12-29T09:30:00.000Z"
    }
  ],
  "count": 12,
  "lastScraped": "2024-12-29T09:30:00.000Z"
}
```

### Manual Scrape Trigger
```bash
POST http://localhost:3001/api/scrape/manual
```

Triggers immediate scraping (use sparingly to avoid rate limits)

### Price Comparison for Specific Product
```bash
GET http://localhost:3001/api/price-comparison/glitter
```

Response:
```json
{
  "success": true,
  "product": "glitter",
  "competitors": [
    {
      "competitor": "Sparkle Industries",
      "price": 850,
      "source": "IndiaMART"
    },
    {
      "competitor": "Rainbow Glitters",
      "price": 780,
      "source": "TradeIndia"
    }
  ],
  "marketAverage": 815,
  "count": 2
}
```

---

## ⏰ Automated Scraping

The server automatically scrapes competitor data:
- **Every 6 hours** (configurable in `.env`)
- **On startup** if cache is older than 6 hours
- **Manual trigger** via API endpoint

Data is cached to:
- Avoid excessive requests
- Prevent IP blocks
- Reduce scraping time
- Ensure data availability

---

## 🗂️ Data Storage

Scraped data is stored in:
```
backend/data/competitors-cache.json
```

Format:
```json
{
  "competitors": [...],
  "lastScraped": "2024-12-29T09:30:00.000Z",
  "cachedAt": "2024-12-29T09:30:05.000Z"
}
```

---

## 🔧 Configuration

Edit `.env` file:

```env
PORT=3001                      # API server port
SCRAPE_INTERVAL_HOURS=6        # Auto-scrape frequency
CACHE_DURATION_HOURS=6         # Cache validity
PUPPETEER_HEADLESS=true        # Run browser in background
PUPPETEER_TIMEOUT=30000        # Page load timeout (ms)
```

---

## 🛡️ Anti-Detection Measures

The scraper includes:
- ✅ Random user agents
- ✅ Polite delays between requests (2-5 seconds)
- ✅ Request timeout handling
- ✅ Headless browser mode
- ✅ Error recovery and fallbacks
- ✅ Caching to reduce requests

---

## ⚠️ Important Notes

### Legal Considerations
1. **Terms of Service**: Web scraping may violate ToS of some platforms
2. **Rate Limiting**: Excessive scraping can result in IP bans
3. **Commercial Use**: Some sites prohibit commercial scraping
4. **Data Accuracy**: Scraped data may not always be accurate or current

### Recommendations
1. **Use responsibly** - Don't scrape too frequently
2. **Respect robots.txt** - Check site scraping policies
3. **Cache aggressively** - Reuse data when possible
4. **Monitor errors** - Watch for blocking or changes
5. **Consider APIs** - Use official APIs when available

---

## 🔌 Frontend Integration

Update your frontend to fetch from this API:

```typescript
// In CompetitorIntelligence.tsx
const [competitorData, setCompetitorData] = useState([]);
const [loading, setLoading] = useState(false);

const fetchCompetitors = async () => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:3001/api/competitors');
    const data = await response.json();
    
    if (data.success) {
      setCompetitorData(data.data);
    }
  } catch (error) {
    console.error('Failed to fetch competitors:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCompetitors();
}, []);
```

---

## 📊 Monitoring

Check server logs for:
- ✅ Scraping start/completion
- ⚠️ Errors and warnings
- 📊 Competitors found per source
- ⏱️ Scraping duration

Example log output:
```
🚀 Mirotec Competitor Intelligence API Starting...
✅ Loaded cached competitor data: 12 competitors
✅ Server running on http://localhost:3001
📊 Tracking 12 competitors
⏰ Auto-scraping every 6 hours

🔄 Starting competitor data scraping...
📊 Scraping IndiaMART...
  📄 Fetching: glitter powder manufacturers
  ✅ Found 4 competitors on IndiaMART
📊 Scrap TradeIndia...
  ✅ Found 5 competitors on TradeIndia
📊 Scraping ExportersIndia...
  ✅ Found 3 competitors on ExportersIndia
✅ Scraping completed in 45.32s. Found 12 competitors.
```

---

## 🚨 Troubleshooting

### "Puppeteer failed to launch"
```bash
# Install chromium dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or install chromium manually
npm install puppeteer --unsafe-perm=true
```

### "ECONNRESET" or "Timeout" errors
- Check internet connection
- Website may be blocking scraper
- Try increasing timeout in `.env`
- Use VPN or proxy if needed

### No data returned
- Check if websites have changed HTML structure
- Review scraper selectors in `scrapers/*.js`
- Try manual scrape: `POST /api/scrape/manual`

---

## 📈 Next Steps (Production)

For production deployment:

1. **Use Proxies**: Rotate IPs to avoid blocks
2. **Add Database**: Store historical price data
3. **Implement Webhooks**: Alert on price changes
4. **Add More Sources**: Expand beyond 3 platforms
5. **Machine Learning**: Predict price trends
6. **API Authentication**: Secure with API keys
7. **Deploy to Cloud**: Use AWS/Google Cloud/Heroku

---

## 🤝 Support

For issues or questions:
- Check server logs
- Review scraper code in `scrapers/`
- Test endpoints with Postman/curl
- Increase logging verbosity

**Happy Scraping!** 🕷️📊
