import type { Database } from "@/lib/database.types"

type CarRow = Database["public"]["Tables"]["cars"]["Row"]

export function getBillableDays(pickupDate: string | Date, dropoffDate: string | Date) {
  const pickup = new Date(pickupDate)
  const dropoff = new Date(dropoffDate)
  const hours = Math.max(0, (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60))

  return {
    hours,
    days: Math.max(1, Math.ceil(hours / 24)),
  }
}

function hashSeed(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

export function pickDailyCars(cars: CarRow[], count: number) {
  if (cars.length <= count) {
    return cars
  }

  const seed = new Date().toISOString().slice(0, 10)
  const base = hashSeed(seed)
  const pool = [...cars]
  const selected: CarRow[] = []

  while (selected.length < count && pool.length > 0) {
    const index = (base + selected.length * 7) % pool.length
    selected.push(pool.splice(index, 1)[0])
  }

  return selected
}

export function getCarPrimaryImage(car: CarRow) {
  if (car.primary_image_url) {
    return car.primary_image_url
  }

  if (car.images?.length) {
    return car.images[0]
  }

  return "/Carsectionui/toyota-innova.jpg"
}
