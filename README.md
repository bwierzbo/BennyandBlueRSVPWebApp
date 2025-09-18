# Benny and Blue RSVP Web App

A modern wedding RSVP website built with Next.js, TypeScript, and PostgreSQL. Deployed on Vercel with automatic GitHub integration.

## Features

- Modern responsive design with Tailwind CSS
- TypeScript for type safety
- PostgreSQL database with Neon
- Form validation with Zod and React Hook Form
- Vercel deployment with zero-config setup

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database account
- Vercel account for deployment

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bwierzbo/BennyandBlueRSVPWebApp.git
   cd BennyandBlueRSVPWebApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual values:
   - Get PostgreSQL connection strings from your Neon dashboard
   - Generate a secure `NEXTAUTH_SECRET` (32+ characters)

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Test database connection**
   ```bash
   npm run db:test
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to GitHub**
   - Fork this repository to your GitHub account
   - Connect your Vercel account to GitHub

2. **Import the project**
   - In Vercel dashboard, click "New Project"
   - Import your forked repository
   - Vercel will auto-detect Next.js configuration

3. **Configure environment variables**
   In your Vercel project dashboard, add these environment variables:

   **Required:**
   - `POSTGRES_URL` - Your Neon PostgreSQL connection string
   - `POSTGRES_PRISMA_URL` - Pooled connection string for Prisma
   - `POSTGRES_URL_NON_POOLING` - Direct connection string
   - `NEXTAUTH_SECRET` - A secure random string (32+ characters)
   - `NEXTAUTH_URL` - Your production domain (e.g., https://yourapp.vercel.app)
   - `APP_URL` - Same as NEXTAUTH_URL

   **Application Settings:**
   - `WEDDING_DATE` - Date in YYYY-MM-DD format
   - `RSVP_DEADLINE` - Deadline in YYYY-MM-DD format

4. **Deploy**
   - Push to your main branch
   - Vercel will automatically build and deploy
   - Your app will be live at your assigned Vercel URL

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Database Setup

### Neon PostgreSQL Setup

1. **Create a Neon account**
   - Visit [neon.tech](https://neon.tech)
   - Create a new project

2. **Get connection strings**
   - Copy the connection string from your Neon dashboard
   - You'll need both pooled and non-pooled versions

3. **Initialize tables**
   ```bash
   npm run db:init
   ```

### Database Schema

The application creates these tables:
- `rsvps` - Stores RSVP responses
- `guests` - Guest information

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:init` - Initialize database tables
- `npm run db:test` - Test database connection

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── db.ts             # Database utilities
│   └── validation.ts     # Zod schemas
├── scripts/              # Database and setup scripts
├── types/                # TypeScript type definitions
├── .env.example          # Environment variables template
├── vercel.json           # Vercel deployment configuration
└── README.md             # This file
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

**Security Note:** Never commit actual environment variables to version control. Always use `.env.local` for local development and configure production variables in your deployment platform.

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify your connection strings are correct
- Check that your IP is allowlisted in Neon (if applicable)
- Ensure SSL mode is set to 'require'

**Build Errors**
- Run `npm run type-check` to identify TypeScript issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

**Vercel Deployment Issues**
- Check environment variables are set correctly
- Verify build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

**RSVP Form Not Working**
- Check browser console for JavaScript errors
- Verify API routes are accessible
- Test database connection with `npm run db:test`

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the Vercel deployment logs
3. Test database connectivity locally
4. Verify all environment variables are set

## Development Guidelines

- Follow existing code patterns and naming conventions
- Write TypeScript types for all new code
- Test changes locally before deploying
- Keep dependencies up to date
- Use semantic commit messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
