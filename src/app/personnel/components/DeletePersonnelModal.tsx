'use client'

import { X } from 'lucide-react'

interface DeletePersonnelModalProps {
  onClose: () => void
  onConfirm: () => void
  mode: 'delete' | 'deactivate'
}

export default function DeletePersonnelModal({ onClose, onConfirm, mode }: DeletePersonnelModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'delete' ? 'Personeli Sil' : 'Personeli Pasife Al'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {mode === 'delete'
            ? 'Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
            : 'Bu personeli pasife almak istediğinizden emin misiniz?'}
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${
              mode === 'delete'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {mode === 'delete' ? 'Sil' : 'Pasife Al'}
          </button>
        </div>
      </div>
    </div>
  )
}