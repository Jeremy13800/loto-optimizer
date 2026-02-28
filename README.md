# 🎰 Loto FDJ Analyzer

Complete web application to analyze historical French Loto draws and generate optimized grids with advanced constraints.

## ⚠️ Disclaimer

**This tool is for educational purposes only.** Statistical optimization does not guarantee any winnings. Lottery results are random and unpredictable. Gambling involves risks. Play responsibly.

## 🚀 Features

### 1. Automatic Data Synchronization

- Automatic retrieval of **2412 draws** from ReducMiz
- Robust HTML parsing with validation
- 6-hour cache to avoid excessive requests
- Error handling and rate limiting

### 2. Results Page

- Paginated list of all draws (25 per page)
- Advanced filters:
  - By number (1-49)
  - By chance number (1-10)
  - By date range (start/end date)
- Detail page for each draw with navigation
- Modernized ReducMiz-style display

### 3. Analysis Page

- Data window selection:
  - All (2412 draws)
  - Last 1000
  - Last 200
  - Custom (from/to dates)
- Complete statistics:
  - Number frequencies 1-49
  - Chance number frequencies 1-10
  - Even/odd distribution
  - Low/high distribution (1-24 / 25-49)
  - Numbers ≥31 per draw
  - Current gaps (draws since last appearance)
  - Top 20 frequent pairs
  - Sum percentiles P10/P90
- Visualizations with Recharts

### 4. Grid Generator

- Generate 1 to 20 grids
- **Hard constraints** (mandatory):
  - Exclude numbers from previous draw
  - Exclude previous chance number
  - Even/odd ratio (2/3 or 3/2)
  - Low/high ratio (2/3 or 3/2)
  - Max 2 numbers per decade
  - Max 1 consecutive pair
  - No consecutive triplets
  - No arithmetic progression ≥3 numbers
- **Soft constraints** (score-based optimization):
  - Sum close to center [P10..P90]
  - Range ≥ 25
  - At least 2 numbers ≥31
  - Limit multiples of 5
  - Avoid popular numbers
  - Avoid specific chance numbers
- **Diversification**:
  - Max overlap between grids (≤1 by default)
  - No duplicates
- CSV export of generated grids

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Jeremy13800/loto-optimizer.git
cd loto-optimizer
```

2. **Install dependencies**

```bash
npm install
```

3. **Initialize the database**

```bash
npx prisma generate
npx prisma db push
```

4. **Start the development server**

```bash
npm run dev
```

5. **Open the application**

```
http://localhost:3000
```

## 📖 Usage Guide

### First Use

1. **Synchronize data**
   - Go to the home page
   - Click "Synchronize now"
   - Wait for synchronization to complete (may take 30-60 seconds)
   - Verify that ~2412 draws have been imported

2. **Explore results**
   - Go to `/results`
   - Use filters to search for specific draws
   - Click "Show details" to view a draw in detail

3. **Analyze statistics**
   - Go to `/analysis`
   - Choose a data window
   - Explore the different visualizations

4. **Generate grids**
   - Go to `/generator`
   - Configure constraints according to your preferences
   - Click "Generate grids"
   - Export to CSV if needed

### Resynchronization

Synchronization is limited to once every 6 hours. To force a new synchronization:

- Wait for cache expiration (6h)
- Or restart the server

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **UI**: React + Tailwind CSS
- **Charts**: Recharts
- **Scraping**: Cheerio

### Project Structure

```
loto-optimizer/
├── app/
│   ├── api/
│   │   ├── draws/
│   │   │   ├── sync/route.ts      # POST - Synchronization
│   │   │   ├── route.ts           # GET - Paginated list
│   │   │   └── [id]/route.ts      # GET - Draw detail
│   │   ├── stats/route.ts         # GET - Statistics
│   │   └── generate/route.ts      # POST - Grid generation
│   ├── results/
│   │   ├── page.tsx               # Draws list
│   │   └── [id]/page.tsx          # Draw detail
│   ├── analysis/page.tsx          # Analysis page
│   ├── generator/page.tsx         # Grid generator
│   ├── layout.tsx                 # Global layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   └── NumberBadge.tsx            # Number badge component
├── lib/
│   ├── prisma.ts                  # Prisma client
│   ├── types.ts                   # TypeScript types
│   ├── scraper.ts                 # Scraping & HTML parsing
│   ├── stats.ts                   # Statistical calculations
│   └── generator.ts               # Grid generation
├── prisma/
│   └── schema.prisma              # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔌 API Endpoints

### POST /api/draws/sync

Synchronizes draws from ReducMiz.

**Response:**

```json
{
  "count": 2412,
  "inserted": 2412,
  "updated": 0,
  "lastDate": "2026-02-25",
  "errors": []
}
```

### GET /api/draws

Paginated list of draws with filters.

**Query params:**

- `limit` (default: 25, max: 100)
- `page` (default: 1)
- `from` (date ISO)
- `to` (date ISO)
- `num` (1-49)
- `chance` (1-10)
- `sort` (asc|desc, default: desc)

**Response:**

```json
{
  "draws": [...],
  "total": 2412,
  "page": 1,
  "limit": 25,
  "totalPages": 97
}
```

### GET /api/draws/[id]

Draw detail with navigation.

**Response:**

```json
{
  "id": "2026-02-25_3-12-25-38-42_7",
  "dateISO": "2026-02-25",
  "dateLabel": "mercredi 25 février 2026",
  "nums": [3, 12, 25, 38, 42],
  "chance": 7,
  "source": "ReducMiz",
  "previousId": "...",
  "nextId": "..."
}
```

### GET /api/stats

Statistics on a data window.

**Query params:**

- `window` (all|1000|200|custom)
- `from` (if custom)
- `to` (if custom)

**Response:**

```json
{
  "window": "all",
  "stats": {
    "totalDraws": 2412,
    "numberFrequencies": [...],
    "chanceFrequencies": [...],
    "sumPercentiles": { "p10": 95, "p90": 165 },
    ...
  }
}
```

### POST /api/generate

Generates optimized grids.

**Body:**

```json
{
  "window": { "window": "all" },
  "count": 5,
  "excludePreviousDraw": true,
  "evenOddRatio": "2/3",
  "minRange": 25,
  ...
}
```

**Response:**

```json
{
  "grids": [
    {
      "nums": [5, 18, 27, 35, 44],
      "chance": 3,
      "score": 87.5,
      "metadata": {
        "sum": 129,
        "range": 39,
        "evenCount": 2,
        "oddCount": 3,
        ...
      }
    }
  ],
  "stats": {
    "iterations": 1250,
    "rejections": 850,
    "avgScore": 85.3
  },
  "warnings": []
}
```

## 🧪 Data Model

### Draw (Prisma)

```prisma
model Draw {
  id          String   @id              // Hash stable: date_nums_chance
  dateISO     String                    // YYYY-MM-DD
  dateLabel   String                    // "mercredi 25 février 2026"
  nums        String                    // JSON: [3,12,25,38,42]
  chance      Int                       // 1-10
  source      String   @default("ReducMiz")
  rawDateText String?                   // Texte brut pour debug
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔍 Generation Algorithm

### 1. Rejection Sampling

- Generates random candidates
- Checks hard constraints
- Rejects if non-compliant
- Continues until enough valid grids

### 2. Score-based Optimization

Each grid receives a score based on:

- Distance to target sum (P10-P90 center)
- Range (bonus if ≥ minRange)
- Number of numbers ≥31
- Multiples of 5
- Numbers to avoid
- Chance (proximity to average frequency)

### 3. Diversification

- Checks overlap between grids
- Avoids exact duplicates
- Ensures pack variety

## 🐛 Debugging

### Synchronization Issues

- Check internet connection
- Verify ReducMiz is accessible
- Check server logs (console)
- Wait 6h if rate limit reached

### Corrupted Database

```bash
rm prisma/dev.db
npx prisma db push
# Then resynchronize data
```

### Parsing Errors

Parsing errors are logged but don't prevent import of valid draws. Check server console for details.

## 📊 Implemented Statistics

1. **Number frequencies**: Number of appearances of each number (1-49)
2. **Chance frequencies**: Number of appearances of each chance number (1-10)
3. **Numbers ≥31**: Distribution of high numbers per draw
4. **Even/Odd**: Ratio distribution (0/5, 1/4, 2/3, 3/2, 4/1, 5/0)
5. **Low/High**: Distribution 1-24 vs 25-49
6. **Sums**: Distribution + percentiles P10/P90
7. **Ranges**: Distribution (max - min)
8. **Gaps**: Number of draws since last appearance of each number
9. **Pairs**: Top 20 most frequent pairs
10. **Decades**: Distribution by decade (implicit in constraints)

## 🚀 Production

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### Environment Variables

No environment variables are required for basic operation. The SQLite database is local.

## 📝 License

This project is for educational use only.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests.

## 📧 Support

For any questions or issues, check the server logs or open an issue on the repository.

---

**Play responsibly! 🍀**
