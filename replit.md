# Go Ecco Climate Control - Field Sales Entry System

## Overview

A professional B2B web application for HVAC field sales representatives to enter and track customer sales data. The system provides role-based access control (Admin/Rep), real-time sales metrics dashboards, and multiple third-party integrations for data synchronization and automation.

Key capabilities:
- Sales entry forms for capturing customer and equipment data
- Dashboard with sales metrics and recent submissions
- Multi-division support (Nevada, Maryland, Georgia, Delaware)
- Webhook integrations for automation workflows
- Role-based access with admin settings management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom build configuration
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON APIs under `/api/*` prefix
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` for shared types between client and server
- **Migrations**: Drizzle Kit for schema management (`db:push` command)

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
    pages/        # Route pages
server/           # Express backend
  replit_integrations/auth/  # Replit Auth integration
shared/           # Shared TypeScript types and schemas
  schema.ts       # Drizzle database schema
  models/         # Data models including auth
```

### Design System
- Typography: DM Sans font family
- Design approach: System-based, inspired by Linear/Notion/Stripe
- Color scheme: CSS variables supporting light/dark modes
- Component spacing: 4/8/16/24/32/48px scale
- Focus on clarity and efficient data entry for mobile field use

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OpenID Connect-based authentication
- Required environment variables: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### Configured Integration Points (via Settings)
- **Primary Webhook**: Zapier/Make automation (webhookUrl)
- **Google Sheets**: Backup data sync (googleSheetId, googleSheetTab)
- **Lidy.ai**: AI-powered lead processing (lidyWebhookUrl, lidyApiKey)
- **Retell AI**: Voice agent integrations (retellApiKey, retellAgentId)
- **Resend**: Email notifications (resendApiKey, resendFromEmail, resendToEmail)

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and validation
- `@tanstack/react-query`: Server state management
- `passport` / `openid-client`: Authentication
- `express-session` / `connect-pg-simple`: Session management
- Radix UI primitives: Accessible component foundations