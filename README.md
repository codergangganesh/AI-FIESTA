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
a

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
