import { supabase } from '../supabase'

export interface FileUpload {
  id?: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy: string
  entityType: 'spool' | 'project' | 'personnel' | 'workOrder' | 'shipment' | 'inventory'
  entityId: string
  description?: string
}

export const storageService = {
  // Dosya yükleme
  async uploadFile(
    file: File,
    entityType: FileUpload['entityType'],
    entityId: string,
    description?: string
  ): Promise<FileUpload | null> {
    try {
      console.log('Dosya yükleme başladı:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        entityType,
        entityId
      })

      // Dosya yolu entity bazlı oluşturulsun
      const fileExt = file.name.split('.').pop()
      const fileName = `${entityType}/${entityId}/${Date.now()}.${fileExt}`
      
      console.log('Dosya yolu:', fileName)
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (error) {
        console.error('Dosya yükleme hatası:', error)
        return null
      }

      console.log('Dosya başarıyla yüklendi:', data)

      // Dosya URL'ini al
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      // Veritabanına kaydet
      const fileRecord: Omit<FileUpload, 'id'> = {
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: (await supabase.auth.getUser()).data.user?.id || '',
        entityType,
        entityId,
        description
      }

      const { data: dbData, error: dbError } = await supabase
        .from('file_uploads')
        .insert(fileRecord)
        .select()
        .single()

      if (dbError) {
        console.log('Veritabanı kayıt hatası:', dbError)
        return null
      }

      return dbData
    } catch (error) {
      console.log('Dosya yükleme hatası:', error)
      return null
    }
  },

  // Dosya silme
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Önce dosya bilgilerini al
      const { data: fileData, error: fetchError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError || !fileData) {
        console.log('Dosya bulunamadı:', fetchError)
        return false
      }

      // Storage'dan sil
      const fileName = fileData.url.split('/').pop()
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('uploads')
          .remove([fileName])

        if (storageError) {
          console.log('Storage silme hatası:', storageError)
        }
      }

      // Veritabanından sil
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)

      if (dbError) {
        console.log('Veritabanı silme hatası:', dbError)
        return false
      }

      return true
    } catch (error) {
      console.log('Dosya silme hatası:', error)
      return false
    }
  },

  // Entity'ye ait dosyaları listele
  async getFilesByEntity(
    entityType: FileUpload['entityType'],
    entityId: string
  ): Promise<FileUpload[]> {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('entityType', entityType)
        .eq('entityId', entityId)
        .order('uploadedAt', { ascending: false })

      if (error) {
        console.log('Dosya listesi alma hatası:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.log('Dosya listesi alma hatası:', error)
      return []
    }
  },

  // Tüm dosyaları listele
  async getAllFiles(): Promise<FileUpload[]> {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .order('uploadedAt', { ascending: false })

      if (error) {
        console.error('Dosya listesi alma hatası:', error)
        throw new Error(`Dosya listesi alınamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Dosya listesi alma hatası:', error)
      throw error
    }
  },

  // Dosya boyutu formatla
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Dosya tipini kontrol et
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '')
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })
  },

  // Maksimum dosya boyutunu kontrol et (5MB)
  isValidFileSize(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
    return file.size <= maxSize
  }
}
