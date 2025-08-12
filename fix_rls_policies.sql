-- RLS politikalarını düzelt - sonsuz döngüyü önle

-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Basit politikalar oluştur (sonsuz döngü olmadan)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin kontrolü için auth.jwt() kullan (profiles tablosunu sorgulamadan)
CREATE POLICY "Service role can do everything" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Authenticated kullanıcılar tüm profilleri görebilir (basit çözüm)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Sadece service role insert yapabilir (API üzerinden)
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update profiles" ON public.profiles FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete profiles" ON public.profiles FOR DELETE USING (auth.role() = 'service_role');