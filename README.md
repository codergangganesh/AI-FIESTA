# 🎊 AI Fiesta - The Ultimate Multi-Model AI Playground

AI Fiesta is a state-of-the-art AI comparison platform designed to help users find the perfect AI response. By sending a single prompt to multiple top-tier LLMs simultaneously, users can benchmark accuracy, speed, and creativity side-by-side in a premium, real-time interface.

<img width="1893" height="943" alt="AI Fiesta Dashboard" src="https://github.com/user-attachments/assets/f57b7216-4db3-4856-b507-1ee7925a4230" />

---

## ✨ Key Features

### 🤖 Multi-Model Comparison
*   **Universal Input:** Send one message to up to 3 models at once.
*   **9+ Premium Models:** Compare models from OpenAI, Google, Anthropic, Meta, and more.
*   **Real-time Benchmarking:** See responses generated side-by-side to evaluate quality instantly.
*   **Response Metrics:** Track response times and context window capabilities.

### ☁️ Persistent Cloud History
*   **Seamless Sync:** All your chat comparisons are saved to a secure Supabase database.
*   **Cross-Device Access:** Start a comparison on your desktop and view it later on your mobile.
*   **Smart History Management:** Easily search, view details, or delete past sessions.
*   **LocalStorage Fallback:** High availability even during network interruptions.

### 🎨 Premium User Experience
*   **Glassmorphism Design:** A modern, sleek UI with vibrant gradients and interactive elements.
*   **Dynamic Animations:** Powered by GSAP and Framer Motion for smooth transitions.
*   **Dark/Light Mode:** Full system-aware theme support for comfortable use in any environment.
*   **Particle Effects:** Interactive background elements that bring the app to life.

### 🛡️ Security & Authentication
*   **Secure Auth:** Robust login/signup system powered by Supabase Auth.
*   **Data Privacy:** Row-level security (RLS) ensures users can only access their own data.
*   **Profile Management:** Customizable user profiles with 195+ country options.

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15+ (App Router, Turbopack) |
| **Styling** | Tailwind CSS 4, Vanilla CSS |
| **Animations** | GSAP, Framer Motion, @tsparticles |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **API** | OpenRouter (Universal AI Access) |
| **Graphics** | Three.js, React Three Fiber (Shaders) |
| **Payment** | Stripe / PayPal (Integration Ready) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- OpenRouter API key
- Supabase account

### Environment Setup
Create a `.env` file in the root directory:
```bash
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AI Fiesta
```

### Installation
1.  **Clone & Install**
    ```bash
    git clone https://github.com/codergangganesh/AI-FIESTA.git
    cd ai-fiesta
    npm install
    ```

2.  **Database Migration**
    Run the SQL scripts found in `supabase/migrations` or follow the instructions in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

3.  **Run Development**
    ```bash
    npm run dev
    ```

---

## 📱 Deployment

### Render (Recommended)
This project is configured for one-click deployment via [render.yaml](render.yaml).
1. Connect your GitHub repo to Render.
2. Add your environment variables.
3. Deploy!

### Vercel
```bash
vercel --prod
```

---

## 📈 Roadmap

- [ ] **Advanced Search:** Full-text search across all saved comparisons.
- [ ] **Custom Tagging:** Categorize chat sessions for better organization.
- [ ] **Export Center:** Export comparisons to PDF, Markdown, or JSON.
- [ ] **Team Collaboration:** Share comparisons with teammates for review.
- [ ] **Leaderboard:** Community-driven rating for the "best" model responses.

---

## 🤝 Contributing
Contributions make the open-source community thrive. Please feel free to fork the repo and submit a PR!

## 👨‍💻 Author
**Mannam Ganesh Babu** - CEO
[GitHub](https://github.com/codergangganesh)

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

