# 🎓 Team DSR - Learn Smart, Grow Fast

A modern, comprehensive educational platform for CBSE Class 9 & 10 students with interactive learning materials, practice tests, and personalized progress tracking.

![Team DSR](https://img.shields.io/badge/Team-DSR-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

### 🔐 Authentication
- **Google Sign-In** - One-click authentication with Firebase
- **User Profiles** - Personalized profiles stored in Supabase
- **Protected Routes** - Secure access to learning materials
- **Session Management** - Persistent login across sessions

### 📚 Learning Materials
- **Study Notes** - Comprehensive chapter-wise notes
- **Previous Papers** - Past year question papers with solutions
- **Practice Tests** - Interactive quizzes with instant feedback
- **Course Catalog** - Complete CBSE curriculum coverage

### 🎨 User Experience
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Beautiful UI** - Modern, clean interface with smooth animations
- **Dark Mode Ready** - Easy on the eyes (coming soon)
- **Fast Performance** - Optimized for speed

### 📊 Progress Tracking
- **Dashboard** - Personalized learning dashboard
- **Score History** - Track quiz performance over time
- **Streak Counter** - Daily learning streaks
- **Analytics** - Detailed progress insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase account (free)
- Supabase account (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/TeamDSR.git
cd TeamDSR
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase and Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5000
```

### Detailed Setup

For detailed setup instructions, see:
- **[Quick Start Guide](QUICK_START.md)** - Get running in 10 minutes
- **[Authentication Setup](AUTH_SETUP_GUIDE.md)** - Firebase & Supabase configuration
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production

## 📁 Project Structure

```
TeamDSR/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── Navbar.tsx   # Navigation with auth
│   │   │   ├── Footer.tsx   # Footer component
│   │   │   └── ...
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── lib/             # Utilities and configs
│   │   │   ├── firebase.ts  # Firebase setup
│   │   │   └── supabase.ts  # Supabase client
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ...
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                   # Backend server
│   ├── index.ts             # Express server
│   ├── routes.ts            # API routes
│   └── vite.ts              # Vite dev server
├── shared/                   # Shared types/schemas
│   └── schema.ts
├── .env.example             # Environment template
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Wouter** - Routing
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **Lucide Icons** - Icon library

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime
- **TypeScript** - Type safety

### Authentication & Database
- **Firebase Authentication** - User authentication
- **Supabase** - PostgreSQL database
- **Row Level Security** - Data protection

### Development Tools
- **ESBuild** - Fast bundling
- **PostCSS** - CSS processing
- **Drizzle ORM** - Database ORM

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started in 10 minutes
- **[Authentication Setup](AUTH_SETUP_GUIDE.md)** - Detailed auth configuration
- **[Authentication README](AUTHENTICATION_README.md)** - Auth system documentation
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Complete feature list
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 5000)
npm run dev:client       # Start Vite dev server only

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push database schema changes

# Type Checking
npm run check            # Run TypeScript type checking
```

## 🌐 Pages

### Public Pages (No login required)
- `/` - Home page with hero and features
- `/about` - About Team DSR
- `/courses` - All available courses
- `/study-notes` - Study materials library
- `/previous-papers` - Past year papers
- `/careers` - Job opportunities
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/login` - Sign in page

### Protected Pages (Login required)
- `/dashboard` - User dashboard
- `/profile` - User profile management
- `/materials` - Study materials
- `/materials/:id` - Material details
- `/practice` - Practice arena
- `/practice/:id` - Quiz details
- `/practice/:id/play` - Quiz player

## 🔒 Security

- ✅ Firebase OAuth authentication
- ✅ Secure token management
- ✅ Row Level Security (RLS) in Supabase
- ✅ Environment variable protection
- ✅ HTTPS-only in production
- ✅ Protected API routes
- ✅ XSS protection
- ✅ CSRF protection

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5)
- **Secondary**: Purple (#9333EA)
- **Accent**: Pink (#EC4899)

### Typography
- **Headings**: Inter
- **Body**: System fonts

### Components
- Buttons with hover effects
- Cards with shadows
- Responsive grids
- Form inputs with validation
- Toast notifications
- Loading states

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Perfect on iPads and tablets
- **Desktop Enhanced** - Full features on desktop
- **Touch Friendly** - Large tap targets

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Netlify
```bash
netlify deploy --prod
```

### Self-Hosted
See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Digraj Singh Rajput**
- Platform: Team DSR
- Tagline: Learn Smart, Grow Fast

## 🙏 Acknowledgments

- Firebase for authentication
- Supabase for database
- Vercel for hosting
- shadcn/ui for components
- Radix UI for accessible primitives
- Tailwind CSS for styling

## 📊 Project Status

- ✅ Authentication System - Complete
- ✅ User Profiles - Complete
- ✅ Study Materials - Complete
- ✅ Practice Arena - Complete
- ✅ Quiz System - Complete
- ✅ Responsive Design - Complete
- 🚧 Progress Tracking - In Progress
- 🚧 Social Features - Planned
- 🚧 Mobile App - Planned

## 🐛 Known Issues

None at the moment! 🎉

## 📞 Support

For support, email support@teamdsr.com or open an issue on GitHub.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by Team DSR**

*Empowering students to learn smarter and achieve their dreams.*
