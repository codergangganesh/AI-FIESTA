# AI Fiesta v0.1.0 - Multi-Model AI Comparison Platform

AI Fiesta is a cutting-edge Next.js application that enables users to compare responses from multiple AI models side-by-side using OpenRouter. With a sleek, modern interface featuring dark/light mode support, comprehensive user profiles, and advanced analytics, users can evaluate different AI models simultaneously to find the best responses for their queries.

<img width="1893" height="943" alt="image" src="https://github.com/user-attachments/assets/f57b7216-4db3-4856-b507-1ee7925a4230" />


## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- OpenRouter API key
- Supabase account (for database functionality)

### Setup Instructions

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-fiesta
```

2. **Create environment configuration:**
Create a `.env` file in the root directory and add your API keys:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Fiesta
```

3. **Configure OpenRouter Data Policy:**
Visit [https://openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy) and ensure that "Free model publication" is enabled, or select specific models that you want to use. The application is configured to use free-tier models with the `:free` suffix which provides basic access without cost.

4. **Understanding Free Model Usage Limits:**
The application is configured with free-tier models that have the following rate limits:
- Free models (with `:free` suffix): 20 requests per minute, 50-200 requests per day
- To increase limits, purchase credits on OpenRouter (removes most rate limits)
- BYOK (Bring Your Own Key) models have different rate limits

5. **Set up Supabase Database:**
Create the required database tables using the schema defined in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

6. **Install dependencies:**
```bash
npm install
# or
yarn install
```

7. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

8. **Access the application:**
Open [http://localhost:3000](http://localhost:3000) in your browser to start comparing AI models.

## 🎯 Key Features

### 🔍 Multi-Model Comparison
- Compare responses from up to 10+ AI models simultaneously
- Side-by-side response visualization
- Response time tracking for performance comparison
- Best response highlighting

### 💬 Advanced Chat Interface
- Dedicated chat interface for detailed conversations
- Persistent chat history with database storage
- Model-specific response cards with rich formatting
- Copy response functionality
- Real-time streaming responses

### 👤 User Profiles & Authentication
- Secure authentication with Supabase Auth
- Comprehensive user profiles with customizable settings
- Country selection with 195+ countries support
- Profile management and customization
- Dark/light mode preferences per user

### 📊 Analytics Dashboard
- Performance metrics and statistics
- Model usage tracking
- Response quality analysis
- Interactive charts and visualizations
- Response time distribution analysis
- Model performance comparisons

### 📚 Chat History Management
- Browse and search through previous conversations
- Delete unwanted history entries
- View model usage per conversation
- Persistent storage in Supabase database
- Export conversation history

### 🎨 Modern UI/UX
- Responsive design that works on desktop and mobile devices
- Dark/light mode support with smooth transitions
- Smooth animations with Framer Motion
- Intuitive navigation with tooltips
- Modern gradient designs and visual effects
- Particle effects and interactive backgrounds

### 💰 Flexible Pricing Plans
- Free tier with basic features
- Pro plan (₹199/month or ₹1,999/year)
- Pro Plus plan (₹399/month or ₹3,999/year)
- Save 20% on annual subscriptions

### 🌐 Enhanced Landing Page
- Interactive hero section with particle effects
- Feature showcases and tutorials
- Modern testimonials and social proof
- Video tutorial integration
- Footer with social media links

### 🧠 Extensive Model Support
- Access to 50+ AI models from leading providers
- Detailed model information and capabilities
- Provider-specific styling and branding
- Model selection with filtering options

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   ├── dashboard/          # Analytics dashboard
│   ├── history/            # Chat history
│   └── layout.tsx          # Root layout
├── components/             # Reusable UI components
│   ├── chat/               # Chat-specific components
│   ├── history/            # History components
│   └── layout/             # Layout components
├── lib/                    # Utility functions and data
├── services/               # Business logic and external service integrations
├── types/                  # TypeScript type definitions
└── contexts/               # React context providers
```

### Core Components

| Component | Description |
|-----------|-------------|
| `ModernChatInterface.tsx` | Main chat interface with sidebar navigation |
| `AIResponseCard.tsx` | Individual model response display with actions |
| `ModelSelector.tsx` | Model selection and configuration panel |
| `ModernHistoryInterface.tsx` | Chat history browsing and management |
| `LandingPage.tsx` | Enhanced landing page with hero section |
| `ModernAuthForm.tsx` | Modern authentication interface |
| `ProfileDropdown.tsx` | User profile management dropdown |
| `SharedSidebar.tsx` | Shared navigation sidebar component |

### Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing Page | `/` | Homepage with features showcase |
| Chat Interface | `/chat` | Multi-model AI comparison interface |
| Dashboard | `/dashboard` | Analytics and performance metrics |
| Profile | `/profile` | User profile management |
| History | `/history` | Chat history browser |
| Pricing | `/pricing` | Subscription plans and pricing |
| Authentication | `/auth` | Login/signup interface |

### Database Schema

Chat sessions are stored in a Supabase PostgreSQL database. See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for detailed schema information.

## 🛠️ Technical Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0 with custom gradients
- **UI Components**: 
  - Lucide React icons
  - Framer Motion for animations
  - Custom UI components with shadcn/ui patterns
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with SSR support
- **Payment Integration**: 
  - Stripe (@stripe/stripe-js)
  - PayPal REST SDK
- **Build Tool**: Turbopack
- **Additional Libraries**:
  - @number-flow/react for animated numbers
  - @tsparticles for particle effects
  - clsx and tailwind-merge for className management
  - uuid for unique identifiers
- **Deployment**: Vercel-ready with Render.com support

## 🐛 Troubleshooting

If you encounter issues with database functionality, please refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common solutions.

## 🚀 Recent Updates

- ✨ Added modern authentication interface with enhanced UI
- 🎨 Updated landing page hero section with particle effects
- 🌓 Implemented dark/light mode support throughout the app
- 👤 Enhanced profile page with country selection (195+ countries)
- 📊 Improved dashboard with interactive charts and visualizations
- 📱 Optimized mobile layout and responsiveness
- 🔗 Added social media links in footer
- 💳 Integrated pricing plans with INR support
- 🎬 Added video tutorial integration
- ⚡ Performance optimizations with Turbopack

## 📱 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Render.com Deployment
The project includes a `render.yaml` configuration file for easy deployment on Render.com. Simply connect your repository and Render will automatically deploy using the configuration.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Author

**Mannam Ganesh Babu** - CEO

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details