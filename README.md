# AI-FIESTA

A modern AI chat application built with Next.js, featuring multiple AI models, chat history, and real-time interactions.

## Features

- Multiple AI model support
- Chat sessions and history management
- User authentication
- Dark mode support
- Dashboard with performance analytics
- Text-to-speech capabilities
- Real-time chat interface
- User profile management

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Database**: Supabase
- **Styling**: CSS/Tailwind
- **Authentication**: Supabase Auth

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── config/          # Configuration files
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── lib/             # Utility libraries
├── services/        # API services
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file with the required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Add other required variables
```

## License

See LICENSE file for details.
