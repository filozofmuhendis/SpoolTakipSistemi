import { supabase, supabaseAdmin } from '@/lib/supabase'
import { personnelService } from '@/lib/services/personnel'

export default async function TestProfiles() {
  let profiles: any[] = []
  let adminProfiles: any[] = []
  let serviceProfiles: any[] = []
  let error: string | null = null
  let adminError: string | null = null
  let serviceError: string | null = null
  
  // Normal client ile test
  try {
    console.log('Server: Normal client ile profiles tablosunu kontrol ediliyor...')
    
    const { data, error: supabaseError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
    
    console.log('Server: Normal client yanıtı:', { data, error: supabaseError, count })
    
    if (supabaseError) {
      console.error('Server: Normal client hatası:', supabaseError)
      error = supabaseError.message
    } else {
      profiles = data || []
      console.log('Server: Normal client - Bulunan profil sayısı:', profiles.length)
    }
    
  } catch (err) {
    console.error('Server: Normal client genel hata:', err)
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
  }
  
  // Admin client ile test
  if (supabaseAdmin) {
    try {
      console.log('Server: Admin client ile profiles tablosunu kontrol ediliyor...')
      
      const { data, error: adminSupabaseError, count } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' })
      
      console.log('Server: Admin client yanıtı:', { data, error: adminSupabaseError, count })
      
      if (adminSupabaseError) {
        console.error('Server: Admin client hatası:', adminSupabaseError)
        adminError = adminSupabaseError.message
      } else {
        adminProfiles = data || []
        console.log('Server: Admin client - Bulunan profil sayısı:', adminProfiles.length)
      }
      
    } catch (err) {
      console.error('Server: Admin client genel hata:', err)
      adminError = err instanceof Error ? err.message : 'Bilinmeyen hata'
    }
   }
   
   // PersonnelService ile test
   try {
     console.log('Server: PersonnelService ile profiles tablosunu kontrol ediliyor...')
     
     const serviceData = await personnelService.getAllPersonnel()
     
     console.log('Server: PersonnelService yanıtı:', { data: serviceData, count: serviceData.length })
     
     serviceProfiles = serviceData || []
     console.log('Server: PersonnelService - Bulunan profil sayısı:', serviceProfiles.length)
     
   } catch (err) {
     console.error('Server: PersonnelService genel hata:', err)
     serviceError = err instanceof Error ? err.message : 'Bilinmeyen hata'
   }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profiles Test (Server-Side)</h1>
      
      {/* Normal Client Sonuçları */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Normal Client Sonuçları</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Hata:</strong> {error}
          </div>
        )}
        
        <div className="mb-4">
          <p><strong>Toplam Profil Sayısı:</strong> {profiles.length}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Profiller:</h3>
          {profiles.length === 0 ? (
            <p className="text-gray-500">Hiç profil bulunamadı.</p>
          ) : (
            profiles.map((profile, index) => (
              <div key={profile.id || index} className="bg-gray-100 p-3 rounded">
                <p><strong>ID:</strong> {profile.id}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Ad Soyad:</strong> {profile.full_name}</p>
                <p><strong>Pozisyon:</strong> {profile.position}</p>
                <p><strong>Departman:</strong> {profile.department}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Admin Client Sonuçları */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Admin Client Sonuçları</h2>
        
        {adminError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Admin Hata:</strong> {adminError}
          </div>
        )}
        
        <div className="mb-4">
          <p><strong>Admin Toplam Profil Sayısı:</strong> {adminProfiles.length}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Admin Profiller:</h3>
          {adminProfiles.length === 0 ? (
            <p className="text-gray-500">Admin client ile hiç profil bulunamadı.</p>
          ) : (
            adminProfiles.map((profile, index) => (
              <div key={profile.id || index} className="bg-blue-100 p-3 rounded">
                <p><strong>ID:</strong> {profile.id}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Ad Soyad:</strong> {profile.full_name}</p>
                <p><strong>Pozisyon:</strong> {profile.position}</p>
                <p><strong>Departman:</strong> {profile.department}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* PersonnelService Sonuçları */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">PersonnelService Sonuçları</h2>
        
        {serviceError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Service Hata:</strong> {serviceError}
          </div>
        )}
        
        <div className="mb-4">
          <p><strong>Service Toplam Profil Sayısı:</strong> {serviceProfiles.length}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Service Profiller:</h3>
          {serviceProfiles.length === 0 ? (
            <p className="text-gray-500">PersonnelService ile hiç profil bulunamadı.</p>
          ) : (
            serviceProfiles.map((profile, index) => (
              <div key={profile.id || index} className="bg-green-100 p-3 rounded">
                <p><strong>ID:</strong> {profile.id}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Ad Soyad:</strong> {profile.full_name}</p>
                <p><strong>Pozisyon:</strong> {profile.position}</p>
                <p><strong>Departman:</strong> {profile.department}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}