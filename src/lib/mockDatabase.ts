// Client-side mock database with localStorage persistence
// Designed for demo presentation of Spool Takip Sistemi (AtölyeAkış)

export interface MockDatabase {
  projects: any[]
  spools: any[]
  profiles: any[]
  work_orders: any[]
  shipments: any[]
  materials: any[]
  material_requests: any[]
  quality_checks: any[]
  notifications: any[]
  inventory: any[]
  inventory_transactions: any[]
  audit_logs: any[]
  documents: any[]
  work_hours: any[]
  equipment: any[]
  productions: any[]
}

const DEFAULT_PROJECTS = [
  {
    id: 'p1-uuid-1111-2222',
    name: 'Ege Gaz Boru Hattı Genişletme Projesi',
    description: 'Ege bölgesi doğalgaz dağıtım hattı basınç düşürme istasyonu ve bağlantı boruları spool üretimi.',
    start_date: '2026-01-10T08:00:00Z',
    end_date: '2026-08-30T17:00:00Z',
    status: 'active',
    budget: 1250000,
    manager_id: 'u1-uuid-admin',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-06-23T10:00:00Z',
    project_code: 'EG-2026-01',
    client_name: 'Ege Gaz A.Ş.',
    shipyard: 'Aliağa Tesisleri',
    ship: 'İstasyon A'
  },
  {
    id: 'p2-uuid-3333-4444',
    name: 'Tüpraş Rafineri Revizyonu Phase 2',
    description: 'Tüpraş İzmit Rafinerisi U-7000 ünitesi yüksek basınçlı buhar hatları spool yenileme projesi.',
    start_date: '2025-06-15T08:00:00Z',
    end_date: '2026-03-20T17:00:00Z',
    status: 'completed',
    budget: 850000,
    manager_id: 'u2-uuid-manager',
    created_at: '2025-06-15T08:00:00Z',
    updated_at: '2026-03-20T17:00:00Z',
    project_code: 'TPR-2025-02',
    client_name: 'Tüpraş A.Ş.',
    shipyard: 'Körfez Rafinerisi',
    ship: 'U-7000 Ünitesi'
  },
  {
    id: 'p3-uuid-5555-6666',
    name: 'SOCAR Depolama Tankları Spool Üretimi',
    description: 'SOCAR depolama terminali ürün transfer hatları paslanmaz boru ve spool prefabrikasyonu.',
    start_date: '2026-07-01T08:00:00Z',
    end_date: '2026-12-15T17:00:00Z',
    status: 'pending',
    budget: 620000,
    manager_id: 'u3-uuid-qc',
    created_at: '2026-05-12T08:00:00Z',
    updated_at: '2026-06-23T12:00:00Z',
    project_code: 'SCR-2026-05',
    client_name: 'SOCAR Terminal A.Ş.',
    shipyard: 'Petkim Limanı',
    ship: 'Tank Çiftliği B'
  },
  {
    id: 'p4-uuid-7777-8888',
    name: 'Akkuyu NGS Boru Hatları Fabrikasyonu',
    description: 'Akkuyu Nükleer Güç Santrali 1. Ünite soğutma suyu ve yardımcı boru sistemleri spool imalatı.',
    start_date: '2025-11-01T08:00:00Z',
    end_date: '2027-02-28T17:00:00Z',
    status: 'active',
    budget: 3400000,
    manager_id: 'u1-uuid-admin',
    created_at: '2025-10-15T08:00:00Z',
    updated_at: '2026-06-23T13:00:00Z',
    project_code: 'AKU-NGS-01',
    client_name: 'Akkuyu Nükleer A.Ş.',
    shipyard: 'Mersin Şantiyesi',
    ship: 'Türbin Binası 1'
  }
]

const DEFAULT_PROFILES = [
  {
    id: 'u1-uuid-admin',
    email: 'admin@atolyeakis.com',
    full_name: 'Ahmet Yılmaz',
    name: 'Ahmet Yılmaz',
    role: 'admin',
    status: 'active',
    department: 'Proje Yönetimi',
    position: 'Proje Müdürü',
    phone: '+90 532 111 2233',
    hire_date: '2024-01-15',
    avatar_url: null,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2026-06-23T10:00:00Z'
  },
  {
    id: 'u2-uuid-manager',
    email: 'mehmet@atolyeakis.com',
    full_name: 'Mehmet Can',
    name: 'Mehmet Can',
    role: 'manager',
    status: 'active',
    department: 'Üretim',
    position: 'Atölye Şefi',
    phone: '+90 533 444 5566',
    hire_date: '2024-03-01',
    avatar_url: null,
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2026-06-23T11:00:00Z'
  },
  {
    id: 'u3-uuid-qc',
    email: 'ayse@atolyeakis.com',
    full_name: 'Ayşe Demir',
    name: 'Ayşe Demir',
    role: 'manager',
    status: 'active',
    department: 'Kalite Kontrol',
    position: 'Kalite Kontrol Mühendisi',
    phone: '+90 535 777 8899',
    hire_date: '2024-08-10',
    avatar_url: null,
    created_at: '2024-08-10T08:00:00Z',
    updated_at: '2026-06-23T12:00:00Z'
  },
  {
    id: 'u4-uuid-welder',
    email: 'ali@atolyeakis.com',
    full_name: 'Ali Veli',
    name: 'Ali Veli',
    role: 'user',
    status: 'active',
    department: 'Üretim',
    position: 'Kıdemli Kaynakçı',
    phone: '+90 542 333 4455',
    hire_date: '2025-01-10',
    avatar_url: null,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2026-06-23T09:00:00Z'
  },
  {
    id: 'u5-uuid-fitter',
    email: 'fatma@atolyeakis.com',
    full_name: 'Fatma Kaya',
    name: 'Fatma Kaya',
    role: 'user',
    status: 'active',
    department: 'Üretim',
    position: 'Montaj Teknisyeni',
    phone: '+90 544 555 6677',
    hire_date: '2025-02-15',
    avatar_url: null,
    created_at: '2025-02-15T08:00:00Z',
    updated_at: '2026-06-23T09:30:00Z'
  }
]

const DEFAULT_SPOOLS = [
  {
    id: 's1-uuid-1',
    project_id: 'p1-uuid-1111-2222',
    name: 'SP-EG-001',
    description: 'Basınç düşürme istasyonu giriş manifoldu spool imalatı.',
    material: 'Karbon Çelik A106 Gr.B',
    material_type: 'Carbon Steel',
    diameter: 12,
    dimensions: '12" NPS x 5.2m',
    thickness: 9.52,
    length: 5.2,
    weight: 145.2,
    status: 'completed',
    notes: 'NDT test raporu onaylandı. Sevkiyata hazır.',
    created_by: 'u1-uuid-admin',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-06-20T16:00:00Z'
  },
  {
    id: 's2-uuid-2',
    project_id: 'p1-uuid-1111-2222',
    name: 'SP-EG-002',
    description: 'Manifold yan branş borusu spool imalatı.',
    material: 'Karbon Çelik A106 Gr.B',
    material_type: 'Carbon Steel',
    diameter: 8,
    dimensions: '8" NPS x 3.1m',
    thickness: 8.18,
    length: 3.1,
    weight: 65.4,
    status: 'in_progress',
    notes: 'Kaynak aşamasında.',
    created_by: 'u1-uuid-admin',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-06-23T11:30:00Z'
  },
  {
    id: 's3-uuid-3',
    project_id: 'p1-uuid-1111-2222',
    name: 'SP-EG-003',
    description: 'Basınç düşürme istasyonu çıkış manifoldu spool imalatı.',
    material: 'Karbon Çelik A106 Gr.B',
    material_type: 'Carbon Steel',
    diameter: 12,
    dimensions: '12" NPS x 4.8m',
    thickness: 9.52,
    length: 4.8,
    weight: 134.1,
    status: 'pending',
    notes: 'Ön montaj bekleniyor.',
    created_by: 'u1-uuid-admin',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 's4-uuid-4',
    project_id: 'p4-uuid-7777-8888',
    name: 'SP-AKU-101',
    description: 'Soğutma suyu hattı ana kollektör spool imalatı.',
    material: 'Paslanmaz Çelik SS316L',
    material_type: 'Stainless Steel 316',
    diameter: 16,
    dimensions: '16" NPS x 6.5m',
    thickness: 12.7,
    length: 6.5,
    weight: 310.8,
    status: 'completed',
    notes: 'Kullanım yeri nükleer alan. %100 Radyografi testi yapıldı.',
    created_by: 'u1-uuid-admin',
    created_at: '2025-11-05T09:00:00Z',
    updated_at: '2026-06-18T15:00:00Z'
  },
  {
    id: 's5-uuid-5',
    project_id: 'p4-uuid-7777-8888',
    name: 'SP-AKU-102',
    description: 'Pompa emiş borusu ara spool.',
    material: 'Paslanmaz Çelik SS316L',
    material_type: 'Stainless Steel 316',
    diameter: 10,
    dimensions: '10" NPS x 2.4m',
    thickness: 9.27,
    length: 2.4,
    weight: 84.6,
    status: 'in_progress',
    notes: 'Montaj tamamlandı, kaynak bekleniyor.',
    created_by: 'u1-uuid-admin',
    created_at: '2025-11-05T09:00:00Z',
    updated_at: '2026-06-23T10:00:00Z'
  }
]

const DEFAULT_WORK_ORDERS = [
  {
    id: 'wo-uuid-1',
    number: 'WO-2026-001',
    title: 'SP-EG-001 Ön Montaj & Hazırlık',
    description: 'Boru kesim, ağız açma ve fit-up işlemlerinin tamamlanması.',
    project_id: 'p1-uuid-1111-2222',
    spool_id: 's1-uuid-1',
    assigned_to: 'u5-uuid-fitter',
    priority: 'medium',
    status: 'completed',
    planned_start_date: '2026-06-01T08:00:00Z',
    planned_end_date: '2026-06-03T17:00:00Z',
    actual_start_date: '2026-06-01T08:00:00Z',
    actual_end_date: '2026-06-02T16:30:00Z',
    completed_at: '2026-06-02T16:30:00Z',
    created_by: 'u2-uuid-manager',
    created_at: '2026-05-28T09:00:00Z',
    updated_at: '2026-06-02T16:30:00Z'
  },
  {
    id: 'wo-uuid-2',
    number: 'WO-2026-002',
    title: 'SP-EG-001 Kaynak İmalatı',
    description: 'Giriş manifoldu TIG+SMAW kaynak işlemlerinin WPS\'e uygun yapılması.',
    project_id: 'p1-uuid-1111-2222',
    spool_id: 's1-uuid-1',
    assigned_to: 'u4-uuid-welder',
    priority: 'high',
    status: 'completed',
    planned_start_date: '2026-06-04T08:00:00Z',
    planned_end_date: '2026-06-08T17:00:00Z',
    actual_start_date: '2026-06-04T08:00:00Z',
    actual_end_date: '2026-06-08T15:00:00Z',
    completed_at: '2026-06-08T15:00:00Z',
    created_by: 'u2-uuid-manager',
    created_at: '2026-05-28T09:00:00Z',
    updated_at: '2026-06-08T15:00:00Z'
  },
  {
    id: 'wo-uuid-3',
    number: 'WO-2026-003',
    title: 'SP-EG-002 Kaynak İmalatı',
    description: 'SP-EG-002 spool kaynak işleri (TIG kaynak).',
    project_id: 'p1-uuid-1111-2222',
    spool_id: 's2-uuid-2',
    assigned_to: 'u4-uuid-welder',
    priority: 'medium',
    status: 'in_progress',
    planned_start_date: '2026-06-20T08:00:00Z',
    planned_end_date: '2026-06-24T17:00:00Z',
    actual_start_date: '2026-06-20T08:00:00Z',
    actual_end_date: null,
    completed_at: null,
    created_by: 'u2-uuid-manager',
    created_at: '2026-06-18T10:00:00Z',
    updated_at: '2026-06-23T11:30:00Z'
  },
  {
    id: 'wo-uuid-4',
    number: 'WO-2026-004',
    title: 'SP-AKU-102 Fit-Up (Montaj)',
    description: 'Akkuyu pompası ara spool montajı.',
    project_id: 'p4-uuid-7777-8888',
    spool_id: 's5-uuid-5',
    assigned_to: 'u5-uuid-fitter',
    priority: 'urgent',
    status: 'in_progress',
    planned_start_date: '2026-06-22T08:00:00Z',
    planned_end_date: '2026-06-23T17:00:00Z',
    actual_start_date: '2026-06-22T09:00:00Z',
    actual_end_date: null,
    completed_at: null,
    created_by: 'u2-uuid-manager',
    created_at: '2026-06-21T08:30:00Z',
    updated_at: '2026-06-23T10:00:00Z'
  }
]

const DEFAULT_SHIPMENTS = [
  {
    id: 'sh-uuid-1',
    project_id: 'p1-uuid-1111-2222',
    number: 'SH-2026-0001',
    destination: 'Aliağa Ege Gaz LNG Terminali',
    shipment_date: '2026-06-25T09:00:00Z',
    status: 'pending',
    notes: 'Tamamlanan SP-EG-001 spoolu sevk edilecek. Vinç ve tır ayarlandı.',
    created_by: 'u1-uuid-admin',
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-23T11:00:00Z'
  },
  {
    id: 'sh-uuid-2',
    project_id: 'p2-uuid-3333-4444',
    number: 'SH-2026-0002',
    destination: 'Tüpraş Körfez Tesisleri',
    shipment_date: '2026-03-22T09:00:00Z',
    status: 'delivered',
    notes: 'Revizyon spoolları teslim edildi ve montaj tamamlandı.',
    created_by: 'u1-uuid-admin',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-22T15:00:00Z'
  }
]

const DEFAULT_MATERIALS = [
  {
    id: 'm-uuid-1',
    name: 'Boru 12" Carbon Steel A106 Gr.B',
    type: 'raw_material',
    unit: 'Metre',
    stock_quantity: 120,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'm-uuid-2',
    name: 'Boru 8" Carbon Steel A106 Gr.B',
    type: 'raw_material',
    unit: 'Metre',
    stock_quantity: 85,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'm-uuid-3',
    name: 'Flanş 12" ANSI 150# WN',
    type: 'raw_material',
    unit: 'Adet',
    stock_quantity: 32,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'm-uuid-4',
    name: 'Boru 16" Stainless Steel SS316L',
    type: 'raw_material',
    unit: 'Metre',
    stock_quantity: 45,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'm-uuid-5',
    name: 'Kaynak Elektrodu 3.25mm E7018',
    type: 'consumable',
    unit: 'Kutu',
    stock_quantity: 15, // Low stock alert!
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  }
]

const DEFAULT_INVENTORY = [
  {
    id: 'i-uuid-1',
    name: 'Boru 12" Carbon Steel A106 Gr.B',
    code: 'PIPE-12CS-A106',
    category: 'Boru',
    type: 'raw_material',
    quantity: 120,
    unit: 'Metre',
    cost: 150,
    location: 'A-1 Rafı',
    supplier: 'Borusan Metal A.Ş.',
    project_id: null,
    min_stock: 50,
    max_stock: 500,
    status: 'active',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'i-uuid-2',
    name: 'Boru 8" Carbon Steel A106 Gr.B',
    code: 'PIPE-08CS-A106',
    category: 'Boru',
    type: 'raw_material',
    quantity: 85,
    unit: 'Metre',
    cost: 95,
    location: 'A-2 Rafı',
    supplier: 'Borusan Metal A.Ş.',
    project_id: null,
    min_stock: 40,
    max_stock: 400,
    status: 'active',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'i-uuid-3',
    name: 'Flanş 12" ANSI 150# WN',
    code: 'FLG-12-150WN',
    category: 'Flanş',
    type: 'raw_material',
    quantity: 32,
    unit: 'Adet',
    cost: 75,
    location: 'B-1 Bölümü',
    supplier: 'Gedik Döküm A.Ş.',
    project_id: null,
    min_stock: 10,
    max_stock: 100,
    status: 'active',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'i-uuid-4',
    name: 'Kaynak Elektrodu 3.25mm E7018',
    code: 'ELC-325-E7018',
    category: 'Sarf Malzemesi',
    type: 'consumable',
    quantity: 15,
    unit: 'Kutu',
    cost: 45,
    location: 'Dolap 3-C',
    supplier: 'Oerlikon Kaynak Ltd.',
    project_id: null,
    min_stock: 20, // Threshold crossed -> low stock
    max_stock: 200,
    status: 'active',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-06-23T08:00:00Z'
  }
]

const DEFAULT_QUALITY_CHECKS = [
  {
    id: 'qc-uuid-1',
    urun_alt_kalemi_id: 's1-uuid-1',
    work_order_id: 'wo-uuid-2',
    inspector_id: 'u3-uuid-qc',
    check_date: '2026-06-09T10:00:00Z',
    status: 'passed',
    notes: 'Görsel kontrol başarılı, kaynak boylarında hata yok. RT filmleri incelendi, gözenek veya çatlak tespit edilmedi. %100 Geçti.',
    measurements: { visual: 'OK', radiography: 'Passed', dimensions: 'Within Tolerance' },
    photos: null,
    next_check_date: null,
    created_at: '2026-06-09T10:30:00Z',
    updated_at: '2026-06-09T10:30:00Z'
  }
]

const DEFAULT_MATERIAL_REQUESTS = [
  {
    id: 'mr-uuid-1',
    request_number: 'REQ-2026-0045',
    project_id: 'p1-uuid-1111-2222',
    urun_alt_kalemi_id: 's2-uuid-2',
    requested_by: 'u2-uuid-manager',
    status: 'approved',
    priority: 'medium',
    request_date: '2026-06-19T09:00:00Z',
    required_date: '2026-06-21T17:00:00Z',
    approved_by: 'u1-uuid-admin',
    approved_at: '2026-06-19T11:00:00Z',
    notes: 'Kaynak işlemi için sarf malzeme elektrot talebidir.',
    created_at: '2026-06-19T09:00:00Z',
    updated_at: '2026-06-19T11:00:00Z'
  }
]

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'audit-1',
    table_name: 'projects',
    record_id: 'p1-uuid-1111-2222',
    action: 'INSERT',
    operation: 'INSERT',
    user_id: 'u1-uuid-admin',
    changed_by: 'u1-uuid-admin',
    details: 'Yeni proje oluşturuldu: Ege Gaz Boru Hattı Genişletme Projesi',
    created_at: '2026-01-10T08:05:00Z'
  },
  {
    id: 'audit-2',
    table_name: 'spools',
    record_id: 's1-uuid-1',
    action: 'UPDATE',
    operation: 'UPDATE',
    user_id: 'u3-uuid-qc',
    changed_by: 'u3-uuid-qc',
    details: 'Spool SP-EG-001 durumu completed olarak güncellendi.',
    created_at: '2026-06-20T16:00:00Z'
  }
]

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n-1',
    user_id: 'u1-uuid-admin',
    title: 'Düşük Stok Uyarısı',
    message: 'Kaynak Elektrodu 3.25mm E7018 stoğu kritik seviyenin (20 kutu) altına düştü. Mevcut stok: 15 kutu.',
    read: false,
    created_at: '2026-06-23T08:00:00Z'
  },
  {
    id: 'n-2',
    user_id: 'u1-uuid-admin',
    title: 'Spool İmalatı Tamamlandı',
    message: 'Ege Gaz Boru Hattı projesindeki SP-EG-001 spoolu kalite kontrol onayını alarak tamamlandı.',
    read: true,
    created_at: '2026-06-20T16:05:00Z'
  }
]

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-1',
    project_id: 'p1-uuid-1111-2222',
    name: 'ege-gaz-spool-listesi.xlsx',
    file_url: 'project/p1-uuid-1111-2222/spool-list/ege-gaz-spool-listesi.xlsx',
    url: 'project/p1-uuid-1111-2222/spool-list/ege-gaz-spool-listesi.xlsx',
    created_by: 'u1-uuid-admin',
    uploaded_by: 'u1-uuid-admin',
    created_at: '2026-01-12T10:00:00Z',
    uploaded_at: '2026-01-12T10:00:00Z'
  }
]

const DEFAULT_WORK_HOURS = [
  {
    id: 'wh-1',
    personnel_id: 'u4-uuid-welder',
    project_id: 'p1-uuid-1111-2222',
    start_time: '2026-06-22T08:00:00Z',
    end_time: '2026-06-22T17:00:00Z',
    hours: 8,
    created_at: '2026-06-22T17:15:00Z'
  }
]

const DEFAULT_EQUIPMENT = [
  {
    id: 'eq-1',
    name: 'Fronius TPS 400i Kaynak Makinesi',
    code: 'WLD-FRN-01',
    type: 'welding_machine',
    status: 'active',
    assigned_to: 'u4-uuid-welder'
  }
]

const DEFAULT_PRODUCTIONS = [
  {
    id: 'prod-1',
    project_id: 'p1-uuid-1111-2222',
    spool_id: 's1-uuid-1',
    personnel_id: 'u4-uuid-welder',
    quantity: 1,
    status: 'completed',
    created_at: '2026-06-08T15:00:00Z'
  }
]

export const mockDbManager = {
  getDb(): MockDatabase {
    if (typeof window === 'undefined') {
      return {
        projects: DEFAULT_PROJECTS,
        spools: DEFAULT_SPOOLS,
        profiles: DEFAULT_PROFILES,
        work_orders: DEFAULT_WORK_ORDERS,
        shipments: DEFAULT_SHIPMENTS,
        materials: DEFAULT_MATERIALS,
        material_requests: DEFAULT_MATERIAL_REQUESTS,
        quality_checks: DEFAULT_QUALITY_CHECKS,
        notifications: DEFAULT_NOTIFICATIONS,
        inventory: DEFAULT_INVENTORY,
        inventory_transactions: [],
        audit_logs: DEFAULT_AUDIT_LOGS,
        documents: DEFAULT_DOCUMENTS,
        work_hours: DEFAULT_WORK_HOURS,
        equipment: DEFAULT_EQUIPMENT,
        productions: DEFAULT_PRODUCTIONS
      }
    }

    const saved = localStorage.getItem('spool_takip_db')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse database, resetting to default', e)
      }
    }

    const initialDb: MockDatabase = {
      projects: DEFAULT_PROJECTS,
      spools: DEFAULT_SPOOLS,
      profiles: DEFAULT_PROFILES,
      work_orders: DEFAULT_WORK_ORDERS,
      shipments: DEFAULT_SHIPMENTS,
      materials: DEFAULT_MATERIALS,
      material_requests: DEFAULT_MATERIAL_REQUESTS,
      quality_checks: DEFAULT_QUALITY_CHECKS,
      notifications: DEFAULT_NOTIFICATIONS,
      inventory: DEFAULT_INVENTORY,
      inventory_transactions: [],
      audit_logs: DEFAULT_AUDIT_LOGS,
      documents: DEFAULT_DOCUMENTS,
      work_hours: DEFAULT_WORK_HOURS,
      equipment: DEFAULT_EQUIPMENT,
      productions: DEFAULT_PRODUCTIONS
    }
    localStorage.setItem('spool_takip_db', JSON.stringify(initialDb))
    return initialDb
  },

  saveDb(db: MockDatabase) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spool_takip_db', JSON.stringify(db))
    }
  },

  getTable(table: keyof MockDatabase): any[] {
    const db = this.getDb()
    return db[table] || []
  },

  saveTable(table: keyof MockDatabase, data: any[]) {
    const db = this.getDb()
    db[table] = data
    this.saveDb(db)
  },

  insertRecord(table: keyof MockDatabase, record: any) {
    const data = this.getTable(table)
    const newRecord = {
      id: record.id || Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    }
    data.push(newRecord)
    this.saveTable(table, data)

    // Add Audit Log automatically
    if (table !== 'audit_logs' && table !== 'notifications') {
      this.insertRecord('audit_logs', {
        table_name: table,
        record_id: newRecord.id,
        action: 'INSERT',
        operation: 'INSERT',
        user_id: 'u1-uuid-admin',
        changed_by: 'u1-uuid-admin',
        details: `Yeni ${table} kaydı oluşturuldu. ID: ${newRecord.id}`,
      })
    }

    return newRecord
  },

  updateRecord(table: keyof MockDatabase, id: string, updates: any) {
    const data = this.getTable(table)
    const index = data.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in table ${table}`)
    }

    const updatedRecord = {
      ...data[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    data[index] = updatedRecord
    this.saveTable(table, data)

    // Add Audit Log automatically
    if (table !== 'audit_logs' && table !== 'notifications') {
      this.insertRecord('audit_logs', {
        table_name: table,
        record_id: id,
        action: 'UPDATE',
        operation: 'UPDATE',
        user_id: 'u1-uuid-admin',
        changed_by: 'u1-uuid-admin',
        details: `${table} kaydı güncellendi. ID: ${id}`,
      })
    }

    return updatedRecord
  },

  deleteRecord(table: keyof MockDatabase, id: string) {
    let data = this.getTable(table)
    const exists = data.some(item => item.id === id)
    if (!exists) {
      throw new Error(`Record with id ${id} not found in table ${table}`)
    }
    data = data.filter(item => item.id !== id)
    this.saveTable(table, data)

    // Add Audit Log automatically
    if (table !== 'audit_logs' && table !== 'notifications') {
      this.insertRecord('audit_logs', {
        table_name: table,
        record_id: id,
        action: 'DELETE',
        operation: 'DELETE',
        user_id: 'u1-uuid-admin',
        changed_by: 'u1-uuid-admin',
        details: `${table} kaydı silindi. ID: ${id}`,
      })
    }

    return true
  }
}
