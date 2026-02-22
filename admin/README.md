# Jet & Keys Admin Panel

A comprehensive admin dashboard for managing Jet & Keys car rental and private jet services.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

If you encounter installation issues, try:
```bash
npm install --legacy-peer-deps
```

### 2. Set up Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create all necessary tables

### 3. Start Development Server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000`

## 📋 Features

### 🏠 Dashboard
- Real-time statistics and analytics
- Recent bookings overview
- System alerts and notifications
- Quick action buttons

### 🚗 Car Management
- Add, edit, delete cars
- Upload multiple images
- Set pricing (daily, weekly, monthly)
- Manage car features and specifications
- Track availability and status

### ✈️ Jet Management
- Add, edit, delete jets
- Set hourly and daily pricing
- Manage jet specifications (capacity, range, speed)
- Track availability and status

### 📅 Booking Management
- View all bookings
- Filter by status (pending, approved, active, completed, cancelled)
- Filter by payment status
- Update booking status
- View customer details and special requests

### 👥 User Management
- View all users
- Manage user roles (admin/user)
- Activate/deactivate users

### ⚙️ Settings
- Website settings management
- Checkout configuration (VAT, fees, payment methods)
- Dynamic content control

## 🗄️ Database Schema

The admin panel uses the following main tables:

- **cars** - Car inventory and specifications
- **jets** - Jet inventory and specifications  
- **bookings** - Booking and rental records
- **users** - User accounts and roles
- **website_settings** - Dynamic website content
- **checkout_settings** - Payment and pricing configuration

## 🔧 Configuration

### Environment Variables
The Supabase configuration is already set up in `src/lib/supabase.ts` with your provided credentials.

### Database Connection
- **URL**: `https://dtaspdqcyapnfgcsbtte.supabase.co`
- **API Key**: Already configured in the code

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI Components

Built with:
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **Supabase** - Database and backend

## 🔐 Security

- Row Level Security (RLS) enabled
- Admin-only access to sensitive operations
- Secure API endpoints
- Input validation and sanitization

## 📊 Analytics

The dashboard provides:
- Total cars and jets count
- Booking statistics
- Revenue tracking
- User activity metrics
- Payment status monitoring

## 🚀 Deployment

To deploy the admin panel:

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📞 Support

For any issues or questions, please contact the development team.

---

**Jet & Keys Admin Panel** - Complete control over your rental business! 🚗✈️