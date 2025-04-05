# 🌐 CryptoWeather Nexus

**Real-time dashboard** combining cryptocurrency markets, weather forecasts, and financial news in one sleek interface. Built with modern web technologies for seamless data visualization.

![Dashboard Preview](public/screenshot.png) *(Replace with actual screenshot)*

## ✨ Features

- **Real-time Crypto Prices** (WebSocket updates)
- **Global Weather Forecasts** (3-day outlook)
- **Trending Financial News** (Auto-refreshing)
- **Interactive Charts** (Price history visualization)
- **Responsive Design** (Mobile/Desktop optimized)
- **Dark/Light Mode** (User preference support)

## ⚙️ Tech Stack

| Category          | Technology                          |
|-------------------|-------------------------------------|
| Framework         | Next.js 14 (App Router)             |
| Styling           | Tailwind CSS + CSS Modules          |
| State Management  | Redux Toolkit + RTK Query           |
| Animations        | Framer Motion                       |
| API Client        | Axios                               |
| Icons             | Lucide React                        |
| Charts            | Lightweight Charts (TradingView)    |
| Form Handling     | React Hook Form                     |

## 🌐 API Integrations

| Service           | Provider                  | Usage                     |
|-------------------|---------------------------|---------------------------|
| Cryptocurrency    | CoinGecko API             | Market data, coin info    |
| Real-time Prices  | CoinCap WebSocket         | Live price updates        |
| Weather           | OpenWeatherMap API        | Forecasts, severe alerts  |
| News              | NewsData.io API           | Financial/crypto news     |
| Geolocation       | Browser Geolocation API   | Local weather detection   |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm/yarn/pnpm
- API keys for all services

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/crypto-weather-nexus.git
cd crypto-weather-nexus

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
npm start

**#API INTEGRATION **
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_key_here
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_weather_key_here
NEXT_PUBLIC_NEWSDATA_API_KEY=your_news_key_here


# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start

# or for production with static export
npm run build
npm run export

_**#PROJECT STRUCTURE**_
crypto-weather-nexus/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js 14 app router
│   ├── components/       # Reusable UI components
│   ├── features/         # Redux store slices
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── styles/           # Global CSS/Tailwind config
│ 
├── next.config.js        # Next.js configuration
└── tailwind.config.js    # Tailwind configuration

