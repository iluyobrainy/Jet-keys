import { supabase } from './supabase'

// Image upload function
export async function uploadImage(file: File, folder: string = 'cars'): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Multiple image upload function
export async function uploadMultipleImages(files: File[], folder: string = 'cars'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder))
  const results = await Promise.all(uploadPromises)
  return results.filter(url => url !== null) as string[]
}





