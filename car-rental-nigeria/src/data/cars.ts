export interface Car {
  id: string
  year: string
  brand: string
  model: string
  location: string
  distance: string
  seats: string
  transmission: string
  rating: string
  reviews: string
  price: string
  imageSrc: string
  images?: string[]
  description?: string
  features?: string[]
  owner?: {
    name: string
    avatar: string
    verified: boolean
    responseRate: string
    responseDuration: string
    joinedDate: string
  }
}

export const cars: Car[] = [
  {
    id: "toyota-innova",
    year: "2020",
    brand: "Toyota",
    model: "Innova",
    location: "Bung Handuk",
    distance: "2.2 km from centre",
    seats: "7 seats",
    transmission: "Manual",
    rating: "4.0",
    reviews: "180",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/toyota-innova.jpg",
    images: [
      "/Carsectionui/toyota-innova.jpg",
      "/Carsectionui/toyota-innova-interior.jpg",
      "/Carsectionui/toyota-innova-rear.jpg",
      "/Carsectionui/toyota-innova-front.jpg"
    ],
    description: "Toyota Innova is a reliable and spacious MPV perfect for family trips and group travel. With its comfortable seating and excellent fuel efficiency, it's ideal for both city driving and long-distance journeys.",
    features: [
      "GPS navigation system",
      "Air conditioning",
      "Cruise control",
      "Power windows",
      "Bluetooth connectivity",
      "USB charging ports",
      "Rear parking sensors",
      "Central locking",
      "ABS brakes"
    ],
    owner: {
      name: "Rakabuming Hubner",
      avatar: "/Carinfoui/owner-avatar.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "1 hour",
      joinedDate: "8 months ago"
    }
  },
  {
    id: "chery-tiggo",
    year: "2022",
    brand: "Chery",
    model: "Tiggo 4 Pro",
    location: "Bung Handuk",
    distance: "2.2 km from centre",
    seats: "7 seats",
    transmission: "CVT",
    rating: "4.0",
    reviews: "180",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/chery-tiggo.jpg",
    images: [
      "/Carsectionui/chery-tiggo.jpg",
      "/Carinfoui/car-interior.jpg",
      "/Carinfoui/car-rear.jpg",
      "/Carinfoui/car-front.jpg"
    ],
    description: "Chery Tiggo 4 Pro is a new unit with great performance, recommended for long trips. No smoking or pets please. Cleaning fee for spills.",
    features: [
      "GPS navigation system",
      "Air conditioning",
      "Cruise control",
      "Power windows",
      "Apple CarPlay",
      "Android Auto",
      "Aux/MP3 enabled",
      "Bluetooth wireless",
      "Premium sound"
    ],
    owner: {
      name: "Rakabuming Hubner",
      avatar: "/Carinfoui/owner-avatar.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "1 hour",
      joinedDate: "8 months ago"
    }
  },
  {
    id: "toyota-fortuner",
    year: "2022",
    brand: "Toyota",
    model: "Fortuner 2.800 cc",
    location: "Bung Handuk",
    distance: "2.2 km from centre",
    seats: "7 seats",
    transmission: "Manual",
    rating: "4.0",
    reviews: "180",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/toyota-fortuner.jpg",
    images: [
      "/Carsectionui/toyota-fortuner.jpg",
      "/Carsectionui/toyota-fortuner-interior.jpg",
      "/Carsectionui/toyota-fortuner-rear.jpg",
      "/Carsectionui/toyota-fortuner-front.jpg"
    ],
    description: "Toyota Fortuner is a robust SUV with powerful engine performance and excellent off-road capabilities. Perfect for adventure trips and challenging terrains.",
    features: [
      "4WD system",
      "Hill descent control",
      "Air conditioning",
      "Power windows",
      "Bluetooth connectivity",
      "USB charging ports",
      "Rear parking sensors",
      "Central locking",
      "ABS brakes"
    ],
    owner: {
      name: "Rakabuming Hubner",
      avatar: "/Carinfoui/owner-avatar.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "1 hour",
      joinedDate: "8 months ago"
    }
  },
  {
    id: "toyota-landcruiser",
    year: "2022",
    brand: "Toyota",
    model: "Land Cruiser 300",
    location: "Bung Handuk",
    distance: "2.2 km from centre",
    seats: "7 seats",
    transmission: "Manual",
    rating: "4.0",
    reviews: "180",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/toyota-landcruiser.jpg",
    images: [
      "/Carsectionui/toyota-landcruiser.jpg",
      "/Carsectionui/toyota-landcruiser-interior.jpg",
      "/Carsectionui/toyota-landcruiser-rear.jpg",
      "/Carsectionui/toyota-landcruiser-front.jpg"
    ],
    description: "Toyota Land Cruiser 300 is a premium SUV with luxury features and exceptional performance. Ideal for executive travel and special occasions.",
    features: [
      "Premium leather seats",
      "Advanced infotainment",
      "Climate control",
      "Power windows",
      "Bluetooth connectivity",
      "Wireless charging",
      "360-degree camera",
      "Central locking",
      "ABS brakes"
    ],
    owner: {
      name: "Rakabuming Hubner",
      avatar: "/Carinfoui/owner-avatar.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "1 hour",
      joinedDate: "8 months ago"
    }
  },
  {
    id: "toyota-raize",
    year: "2021",
    brand: "Toyota",
    model: "Raize",
    location: "Bung Handuk",
    distance: "2.2 km from centre",
    seats: "7 seats",
    transmission: "Manual",
    rating: "4.0",
    reviews: "180",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/toyota-raize.jpg",
    images: [
      "/Carsectionui/toyota-raize.jpg",
      "/Carsectionui/toyota-raize-interior.jpg",
      "/Carsectionui/toyota-raize-rear.jpg",
      "/Carsectionui/toyota-raize-front.jpg"
    ],
    description: "Toyota Raize is a compact SUV with modern design and efficient performance. Perfect for city driving and weekend getaways.",
    features: [
      "Compact design",
      "Fuel efficient",
      "Air conditioning",
      "Power windows",
      "Bluetooth connectivity",
      "USB charging ports",
      "Rear parking sensors",
      "Central locking",
      "ABS brakes"
    ],
    owner: {
      name: "Rakabuming Hubner",
      avatar: "/Carinfoui/owner-avatar.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "1 hour",
      joinedDate: "8 months ago"
    }
  }
]

export function getCarById(id: string): Car | undefined {
  return cars.find(car => car.id === id)
}

export function getAllCars(): Car[] {
  return cars
}
