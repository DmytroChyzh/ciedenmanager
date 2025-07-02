# Manager Dashboard

A Next.js application with Firebase authentication and a protected dashboard.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🔒 Protected routes
- 🚀 Ready for Vercel deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable Email/Password authentication

4. Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration:
   ```bash
   cp .env.local.example .env.local
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── dashboard/      # Protected dashboard page
│   ├── login/         # Login page
│   ├── layout.tsx     # Root layout with AuthProvider
│   └── globals.css    # Global styles
├── contexts/          # React contexts
│   └── AuthContext.tsx # Authentication context
└── lib/              # Utility functions
    └── firebase.ts   # Firebase configuration
```

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy your application.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## License

MIT 