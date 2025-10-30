<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <img src="https://github.com/user-attachments/assets/f57b7216-4db3-4856-b507-1ee7925a4230" alt="AI Fiesta Dashboard" width="100%"/>
</div>

<h1 align="center">AI Fiesta v0.1.0 🎉</h1>

<p align="center">
  <strong>Multi-Model AI Comparison Platform</strong>
</p>

<p align="center">
  Compare responses from multiple AI models side-by-side in real-time
</p>

<div align="center">
  
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Render](https://img.shields.io/badge/Render-Deployment-000000?style=for-the-badge&logo=render)](https://render.com/)
[![License](https://img.shields.io/github/license/codergangganesh/ai-fiesta?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 What is AI Fiesta?

AI Fiesta is a revolutionary platform that allows you to compare responses from multiple AI models simultaneously. With a sleek, modern interface featuring dark/light mode support, comprehensive user profiles, and advanced analytics, you can evaluate different AI models side-by-side to find the best responses for your queries.

### 🔍 Why Choose AI Fiesta?

<div align="center">
  
| Feature | Description |
|--------|-------------|
| 🤖 **Multi-Model Comparison** | Compare responses from 10+ AI models simultaneously |
| ⚡ **Real-time Analytics** | Performance metrics and response time tracking |
| 💾 **Persistent Storage** | Chat history stored in Supabase database |
| 🌍 **Universal Input** | Test prompts across multiple models instantly |
| 💰 **Flexible Pricing** | Multiple subscription tiers with INR support |

</div>

---

## 🚀 Key Features

### 💬 Advanced Chat Interface
- Dedicated chat interface for detailed conversations
- Persistent chat history with database storage
- Model-specific response cards with rich formatting
- Copy response functionality
- Real-time streaming responses

### 🎨 Modern UI/UX
- Responsive design that works on desktop and mobile devices
- Dark/light mode support with smooth transitions
- Smooth animations with Framer Motion
- Intuitive navigation with tooltips
- Modern gradient designs and visual effects
- Particle effects and interactive backgrounds

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

### 💰 Flexible Pricing Plans
- Free tier with basic features
- Pro plan (₹199/month or ₹1,999/year)
- Pro Plus plan (₹399/month or ₹3,999/year)
- Save 20% on annual subscriptions

---

## 🧠 Supported AI Models

AI Fiesta supports a wide range of AI models from leading providers:

<div align="center">
  
| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-3.5 Turbo, GPT-4o Mini |
| **Anthropic** | Claude 3 Haiku (Free) |
| **Google** | Gemini Flash 1.5 (Free) |
| **Meta** | LLaMA 3.1 8B (Free) |
| **Mistral AI** | Mistral 7B (Free) |
| **Microsoft** | Phi-3 Mini (Free) |
| **Nous Research** | Hermes 3 8B (Free) |
| **OpenRouter** | Auto Select |

</div>

---

## 🛠️ Technical Stack

<div align="center">
  
| Category | Technologies |
|----------|--------------|
| **Framework** | Next.js 15.5.4 with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4.0 |
| **UI Components** | Lucide React, Framer Motion, shadcn/ui patterns |
| **State Management** | React Context API |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth with SSR support |
| **Payment Integration** | Stripe, PayPal |
| **Build Tool** | Turbopack |
| **Deployment** | Optimized for Render with Vercel support |

</div>

---

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
Visit [https://openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy) and ensure that "Free model publication" is enabled, or select specific models that you want to use.

4. **Set up Supabase Database:**
Create the required database tables using the schema defined in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

5. **Install dependencies:**
```bash
npm install
# or
yarn install
```

6. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

7. **Access the application:**
Open [http://localhost:3000](http://localhost:3000) in your browser to start comparing AI models.

---

## 📱 Deployment

### Deploy on Render (Recommended)

AI Fiesta is optimized for deployment on Render with a pre-configured [render.yaml](render.yaml) file. To deploy:

1. Fork this repository to your GitHub account
2. Sign up for a [Render account](https://render.com/)
3. Create a new Web Service and connect it to your forked repository
4. Configure the following environment variables in your Render dashboard:
   - `OPENROUTER_API_KEY` - Your OpenRouter API key
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `NEXT_PUBLIC_SITE_URL` - Your Render app URL (e.g., https://ai-fiesta.onrender.com)
   - `NEXT_PUBLIC_SITE_NAME` - AI Fiesta

Render will automatically build and deploy your application using the configuration in [render.yaml](render.yaml).

### Alternative: Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🐛 Troubleshooting

If you encounter issues with database functionality, please refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common solutions.

---

## 📈 Recent Updates

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

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 👨‍💻 Author

**Mannam Ganesh Babu** - CEO

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details