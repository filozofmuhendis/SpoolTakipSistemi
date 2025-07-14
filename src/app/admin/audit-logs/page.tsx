"use client"

import { useEffect, useState } from "react";
import { getAuditLogs, AuditLog } from "@/lib/services/auditLogs";
import { getAllPersonnelBasic } from '@/lib/services/personnel'
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { Eye } from "lucide-react";
import { useAuth } from '@/hooks/useAuth'

export default function AuditLogsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState({ table: "", action: "", user: "", from: "", to: "" });
  const [personnelList, setPersonnelList] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    fetchLogs();
    getAllPersonnelBasic()
      .then(list => setPersonnelList(list.map(p => ({ id: p.id, name: p.full_name ?? "" }))))
      .catch(() => {});
    // eslint-disable-next-line
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs({
        tableName: filter.table || undefined,
        action: filter.action || undefined,
        userId: filter.user || undefined,
        from: filter.from || undefined,
        to: filter.to || undefined,
        limit: 50,
      });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Loglar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loading text="Yetki kontrolü..." />
  if (!user || user.role !== 'admin') {
    return <ErrorState title="Erişim Engellendi" description="Bu sayfayı görüntülemek için yönetici (admin) yetkisine sahip olmalısınız." />
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Sistem Logları (Audit Trail)</h1>

      {/* Filtreler */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Tablo adı..."
          value={filter.table}
          onChange={e => setFilter(f => ({ ...f, table: e.target.value }))}
          className="border p-2 rounded w-40"
        />
        <input
          type="text"
          placeholder="Kullanıcı adı veya ID..."
          value={filter.user}
          onChange={e => setFilter(f => ({ ...f, user: e.target.value }))}
          className="border p-2 rounded w-40"
        />
        <select
          value={filter.action}
          onChange={e => setFilter(f => ({ ...f, action: e.target.value }))}
          className="border p-2 rounded w-32"
        >
          <option value="">Tüm İşlemler</option>
          <option value="INSERT">Ekleme</option>
          <option value="UPDATE">Güncelleme</option>
          <option value="DELETE">Silme</option>
        </select>
        <input
          type="date"
          value={filter.from}
          onChange={e => setFilter(f => ({ ...f, from: e.target.value }))}
          className="border p-2 rounded w-36"
          placeholder="Başlangıç"
        />
        <input
          type="date"
          value={filter.to}
          onChange={e => setFilter(f => ({ ...f, to: e.target.value }))}
          className="border p-2 rounded w-36"
          placeholder="Bitiş"
        />
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Filtrele
        </button>
      </div>

      {loading && <Loading text="Loglar yükleniyor..." />}
      {error && <ErrorState title="Loglar yüklenemedi" description={error} />}
      {!loading && !error && logs.length === 0 && <EmptyState title="Log bulunamadı" />}

      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Tarih</th>
                <th className="px-4 py-2 text-left">Tablo</th>
                <th className="px-4 py-2 text-left">Kayıt ID</th>
                <th className="px-4 py-2 text-left">İşlem</th>
                <th className="px-4 py-2 text-left">Kullanıcı</th>
                <th className="px-4 py-2 text-center">Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString("tr-TR")}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.table_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.record_id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {(() => {
                      if (!log.user_id) return <span className="text-gray-400">-</span>;
                      const user = personnelList.find(p => p.id === log.user_id);
                      if (user) return user.name;
                      // ID ile arama desteği için
                      if (log.user_id.includes(filter.user)) return <b>{log.user_id}</b>;
                      return log.user_id;
                    })()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Detayları Gör"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detay Modalı */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Log Detayı</h2>
            <div className="mb-2 text-sm text-gray-500">{new Date(selectedLog.created_at).toLocaleString("tr-TR")}</div>
            <div className="mb-2"><b>Tablo:</b> {selectedLog.table_name}</div>
            <div className="mb-2"><b>Kayıt ID:</b> {selectedLog.record_id}</div>
            <div className="mb-2"><b>İşlem:</b> {selectedLog.action}</div>
            <div className="mb-2"><b>Kullanıcı:</b> {selectedLog.user_id || <span className="text-gray-400">-</span>}</div>
            <div className="mb-2"><b>Önceki Veri:</b>
              <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-40">{JSON.stringify(selectedLog.old_data, null, 2) || '-'}</pre>
            </div>
            <div className="mb-2"><b>Yeni Veri:</b>
              <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-40">{JSON.stringify(selectedLog.new_data, null, 2) || '-'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
