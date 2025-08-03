# Overview

VideoClip Pro is a web-based platform for automated video processing and social media distribution. The system allows users to upload videos, create cuts using time markers, apply obfuscation techniques to avoid content duplication, and automatically publish to multiple social platforms. The application is designed to streamline the workflow of content creators who need to generate multiple short-form videos from longer source material.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using TypeScript and follows a modern component-based architecture. The UI leverages shadcn/ui components with Radix UI primitives for accessibility and consistent design patterns. Styling is handled through Tailwind CSS with a custom design system including CSS variables for theming.

**Key Frontend Decisions:**
- **React with TypeScript**: Provides type safety and modern development experience
- **Wouter for routing**: Lightweight client-side routing solution
- **TanStack Query**: Handles server state management, caching, and background updates
- **shadcn/ui components**: Pre-built accessible components reducing development time
- **Tailwind CSS**: Utility-first styling with custom CSS variables for theming

## Backend Architecture
The backend follows a RESTful API design using Express.js with TypeScript. The architecture separates concerns through distinct layers for routing, business logic, and data access.

**Key Backend Decisions:**
- **Express.js with TypeScript**: Provides familiar Node.js server with type safety
- **Modular route structure**: Routes are organized by feature domain (videos, cuts, processing jobs)
- **Service layer pattern**: FFmpeg operations are encapsulated in a service class
- **Storage abstraction**: Database operations are abstracted through an interface for flexibility

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed to support the video processing workflow with proper relationships and constraints.

**Database Schema:**
- **Users table**: Basic user authentication and identification
- **Videos table**: Stores uploaded video metadata and file paths
- **Cuts table**: Individual video segments with metadata, platform settings, and processing status
- **Processing Jobs table**: Tracks video cutting operations with progress and error handling

## Video Processing
Video operations are handled through FFmpeg integration with a dedicated service class. The system supports video analysis, cutting, and obfuscation techniques.

**Processing Pipeline:**
- **Video upload**: Files are stored locally with metadata extraction
- **Cut point parsing**: Time markers (pipe-separated format) define segment boundaries
- **FFmpeg integration**: Handles video cutting, format conversion, and obfuscation
- **Asynchronous processing**: Jobs are queued and processed with progress tracking

## Authentication & Session Management
The application includes user authentication infrastructure with session-based security using PostgreSQL session storage.

**Security Features:**
- **Session-based authentication**: Uses connect-pg-simple for PostgreSQL session storage
- **File upload validation**: Restricts uploads to MP4 format with size limits
- **Input validation**: Zod schemas validate API requests and database operations

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with WebSocket support for connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations

## File Processing
- **FFmpeg**: Video processing, cutting, format conversion, and metadata manipulation
- **Multer**: Handles multipart file uploads with validation

## UI Components & Styling
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast development server and build tool with React plugin
- **TypeScript**: Type checking and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Social Media APIs (Planned)
The architecture includes infrastructure for social media integration through official APIs:
- **Instagram Graph API**: For Instagram posting
- **YouTube Data API**: For YouTube uploads
- **TikTok Upload API**: For TikTok content distribution
- **Facebook Graph API**: For Facebook page posting

## Runtime & Hosting
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Replit**: Development and hosting platform with integrated tooling