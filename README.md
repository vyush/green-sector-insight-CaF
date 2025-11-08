# Green Sector Insight: Carbon Compliance Tracker

A comprehensive ESG analytics platform for monitoring carbon compliance and emissions intensity across India's cement sector. This investment-grade dashboard provides real-time insights into environmental performance, regulatory alignment, and financial implications of carbon policies.

## 🌟 Key Features

### **Multi-Company Analysis**
- **5 Major Cement Companies**: UltraTech, ACC, Ambuja Cements, Dalmia Cement, JK Cement
- **Plant-Level Data**: Detailed emissions tracking across 50+ manufacturing facilities
- **Government Target Alignment**: Real-time monitoring of mandatory emission reduction targets

### **Advanced Analytics**
- **Carbon Price Sensitivity**: Dynamic scenario analysis with adjustable carbon pricing (₹0-₹10,000/tonne)
- **Emissions Intensity Tracking**: Comprehensive Scope 1, 2, and 3 emissions monitoring
- **Predictive Modeling**: Machine learning-powered projections for 2030-2050 targets
- **Peer Benchmarking**: Comparative analysis across industry leaders

### **Interactive Visualizations**
- **Real-time Charts**: Dynamic emissions trends, intensity gaps, and target alignment
- **Heat Maps**: Geographic emissions distribution across plant locations
- **Regression Analysis**: Statistical modeling for emissions forecasting
- **Investment Impact**: NPV calculations for carbon compliance investments

### **AI-Powered Insights**
- **Gemini AI Integration**: Natural language queries about company performance
- **Web-Grounded Research**: Real-time market intelligence and regulatory updates
- **Automated Analysis**: AI-driven insights on compliance risks and opportunities

### **Professional Reporting**
- **PDF Export**: Investment-grade reports with embedded charts and analysis
- **BRSR Integration**: Direct links to Business Responsibility and Sustainability Reports
- **Methodology Documentation**: Transparent calculation frameworks and assumptions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or bun package manager
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/green-sector-insight.git
cd green-sector-insight

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

## 📊 Data Sources & Methodology

### **Government Compliance Targets**
- Plant-specific reduction targets (% over next 2 years)
- Baseline emissions from 2022-2023 reporting periods
- Ministry of Environment compliance frameworks

### **Emissions Calculations**
- **Scope 1**: Direct emissions from cement production processes
- **Scope 2**: Indirect emissions from purchased electricity
- **Scope 3**: Value chain emissions including raw materials and transportation

### **Financial Modeling**
- Carbon price scenarios: Government policy projections
- Investment requirements: Technology upgrade costs
- NPV calculations: 10-year financial impact assessments

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components for consistent design
- **Recharts** for interactive data visualizations

### **AI Integration**
- **Google Gemini 1.5-pro** for natural language processing
- **Web Search API** for real-time market intelligence
- **Custom grounding** with company-specific data

### **Data Management**
- TypeScript interfaces for type safety
- Centralized data store with company and plant information
- Real-time calculations for emissions and financial metrics

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── charts/          # Chart-specific components
│   └── *.tsx            # Feature components
├── data/                # Static data and configurations
│   ├── companies.ts     # Company and plant data
│   ├── brsrMap.ts      # BRSR report mappings
│   └── prices/         # Stock price data
├── pages/              # Main application pages
│   ├── Index.tsx       # Dashboard home
│   ├── CompanyDetail.tsx # Company analysis
│   ├── GeminiChat.tsx  # AI chat interface
│   ├── Methodology.tsx # Documentation
│   └── *.tsx          # Other pages
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

## 🎯 Usage Guide

### **Dashboard Navigation**
1. **Home Tab**: Overview of all companies with carbon price sensitivity
2. **Methodology Tab**: Detailed calculation frameworks and assumptions
3. **Company X Tab**: Advanced regression analysis and projections
4. **AI Chat Tab**: Natural language queries about company performance
5. **Meet the Team Tab**: Project contributors and contact information

### **Company Analysis**
- Click any company card to access detailed analysis
- Adjust carbon price slider to see financial impact scenarios
- Export comprehensive PDF reports with embedded charts
- Access BRSR reports directly from company profiles

### **AI Chat Features**
- Ask questions about specific companies or industry trends
- Get real-time market updates and regulatory changes
- Receive automated analysis of compliance risks and opportunities

## 📈 Key Metrics Tracked

### **Environmental KPIs**
- Emissions Intensity (tCO₂/tonne cement)
- Absolute Emissions (million tCO₂)
- Government Target Gap (%)
- Year-over-year improvement rates

### **Financial KPIs**
- Carbon Cost Impact (₹ crores)
- Investment Requirements for compliance
- NPV of carbon reduction projects
- Stock price correlation with ESG performance

### **Compliance Metrics**
- Regulatory alignment scores
- Target achievement probability
- Risk assessment ratings
- Peer performance benchmarks

## 🛠️ Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### **Contributing**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📋 API Configuration

### **Gemini AI Setup**
```typescript
// Set your Gemini API key in environment variables
VITE_GEMINI_API_KEY=your_api_key_here
```

### **Data Updates**
Company data is stored in `src/data/companies.ts` and can be updated with:
- New plant locations and capacities
- Updated emissions data
- Revised government targets
- Current stock prices

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **Any static hosting service**

Build command: `npm run build`
Output directory: `dist`

## 📊 Data Accuracy & Disclaimers

- **Data Sources**: Based on publicly available BRSR reports and government notifications
- **Projections**: Statistical models based on historical trends - not investment advice
- **Compliance**: Targets based on current regulatory frameworks subject to change
- **Financial Impact**: Estimates based on carbon pricing scenarios and industry benchmarks

## 📧 Contact & Support

For questions, feedback, or collaboration opportunities:
- Project developed for IIM Ahmedabad Term-5 Corporate Finance coursework
- Focus: ESG analytics and carbon compliance in Indian cement sector
- Framework: Investment-grade analysis for institutional decision-making

---

**Disclaimer**: This dashboard is for educational and research purposes. All financial projections and compliance assessments should be validated with official sources before making investment decisions.
