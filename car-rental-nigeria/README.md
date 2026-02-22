# Jet & Keys - Car Rental Services Nigeria

A modern car rental website built with Next.js, Shadcn UI, and Supabase for the Nigerian market.

## Features

### Customer Features
- 🚗 Browse available cars with detailed information
- 📅 Book cars with flexible date selection
- 💳 Pay on the spot with multiple payment options
- 📱 Responsive design for all devices
- 🔍 Search and filter cars by various criteria
- ⭐ Customer reviews and ratings

### Admin Features
- 📊 Comprehensive dashboard with analytics
- 🚗 Manage car inventory (add, edit, delete)
- 📸 Upload and manage car images
- 📋 View and manage all bookings
- 👥 User management
- 📈 Revenue tracking and reports
- ⚙️ System settings and configuration

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd car-rental-nigeria
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Get your project URL and anon key
   - Create the following tables in your Supabase database:

### Database Schema

#### Cars Table
```sql
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  price_per_week DECIMAL(10,2),
  price_per_month DECIMAL(10,2),
  fuel_type VARCHAR NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  transmission VARCHAR NOT NULL CHECK (transmission IN ('manual', 'automatic')),
  seats INTEGER NOT NULL,
  doors INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  color VARCHAR NOT NULL,
  description TEXT,
  features TEXT[],
  images TEXT[],
  is_available BOOLEAN DEFAULT true,
  location VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  payment_status VARCHAR NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  pickup_location VARCHAR NOT NULL,
  return_location VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   │   ├── cars/          # Car management
│   │   ├── bookings/      # Booking management
│   │   └── page.tsx       # Admin dashboard
│   ├── cars/              # Customer car pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── admin-layout.tsx   # Admin layout component
│   ├── footer.tsx         # Footer component
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
    └── database.ts       # Database types
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email info@jetandkeys.com or create an issue in the repository.
