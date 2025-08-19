# MyCampusMingle - University Search and Comparison Platform

## Overview

MyCampusMingle is a comprehensive university search and comparison platform designed to help students find and evaluate universities across Ghana. The platform provides search capabilities, program comparisons, and eligibility checking based on WASSCE (West African Senior School Certificate Examination) grades. Built with a modern full-stack architecture, it offers a College Scorecard-inspired user experience for discovering educational opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom theme variables and responsive design patterns
- **State Management**: TanStack Query for server state management and React Context for global UI state (comparison selections)
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database Layer**: Drizzle ORM for type-safe database operations with PostgreSQL dialect
- **Storage**: PostgreSQL database with automatic sample data seeding on startup
- **API Design**: RESTful endpoints with structured error handling and request logging middleware
- **Data Initialization**: Automatic database seeding with comprehensive sample data on every app startup

### Data Models
- **Universities**: Core institution data including location, type, size, costs, and performance metrics
- **Programs**: Academic programs with duration, tuition costs, and curriculum details
- **Requirements**: Structured WASSCE grade requirements with core and elective subject specifications
- **Scholarships**: Financial aid information linked to institutions
- **Users**: Basic user management for future authentication features

### Key Features Architecture
- **Search System**: Multi-criteria filtering with query parameters, region, type, and cost range filters
- **Comparison Engine**: Session-based university comparison with persistent selection state
- **Eligibility Checker**: Grade evaluation engine that matches student WASSCE results against program requirements
- **Responsive Design**: Mobile-first approach with adaptive layouts and touch-friendly interactions

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database with automatic sample data seeding
- **Drizzle ORM**: Type-safe database toolkit with schema migrations
- **Neon Database**: Serverless PostgreSQL provider for production deployment
- **Sample Data**: Comprehensive Ghanaian university data (5 universities, 8 programs, requirements, scholarships) loaded automatically on startup

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with hot module replacement and optimized production builds
- **TypeScript**: Static type checking across frontend, backend, and shared code
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **TanStack Query**: Data fetching and caching library for API interactions

### Validation & Forms
- **Zod**: Schema validation library for runtime type checking
- **React Hook Form**: Performant form library with minimal re-renders
- **Drizzle-Zod**: Integration between Drizzle schemas and Zod validation

### Deployment & Hosting
- **Replit**: Development and hosting platform with integrated deployment
- **Express.js**: Web server framework for API endpoints and static file serving
- **Connect-PG-Simple**: PostgreSQL session store for future session management