'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { read, utils } from 'xlsx';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

interface ProjectForm {
  shipyardName: string
  shipName: string
  projectNumber: string
  circuitName: string
  spools: SpoolItem[]
  documents: FileList | null
}

interface SpoolItem {
  number: string
  diameter: string
  material: string
  barcode?: string; // Barkod değerini ekledik
}

export default function NewProject() {
    const [step, setStep] = useState(1)
    const [spools, setSpools] = useState<SpoolItem[]>([])
    const [newSpool, setNewSpool] = useState<SpoolItem>({
      number: '',
      diameter: '',
      material: ''
    });
  
    const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>()
  
    const onSubmit = (data: ProjectForm) => {
      console.log({
        ...data,
        spools: spools
      });
      // API call can be added here
    }
  
    const handleAddSpool = () => {
      if (newSpool.number && newSpool.diameter && newSpool.material) {
        setSpools([...spools, newSpool]);
        setNewSpool({ number: '', diameter: '', material: '' });
      }
    };
  
    const handleRemoveSpool = (index: number) => {
      setSpools(spools.filter((_, i) => i !== index));
    };

    const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
    
        const file = event.target.files[0];
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json<SpoolItem>(worksheet);
    
        setSpools([...spools, ...jsonData]);
      };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Yeni Proje Oluştur</h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex items-center ${num < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Project Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Tersane Adı</label>
                <input
                  {...register('shipyardName', { required: true })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Gemi Adı</label>
                <input
                  {...register('shipName', { required: true })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Proje Numarası</label>
                <input
                  {...register('projectNumber', { required: true })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Devre Adı</label>
                <input
                  {...register('circuitName', { required: true })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}

          {/* Step 2: Spool List */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <input
                  placeholder="Spool No"
                  value={newSpool.number}
                  onChange={(e) => setNewSpool({ ...newSpool, number: e.target.value })}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  placeholder="Çap"
                  value={newSpool.diameter}
                  onChange={(e) => setNewSpool({ ...newSpool, diameter: e.target.value })}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  placeholder="Malzeme"
                  value={newSpool.material}
                  onChange={(e) => setNewSpool({ ...newSpool, material: e.target.value })}
                  className="flex-1 p-2 border rounded"
                />
                <button type="button" onClick={handleAddSpool} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Ekle
                </button>
              </div>
              
              <table className="w-full border rounded">
                <thead>
                  <tr>
                    <th className="p-2">Spool No</th>
                    <th className="p-2">Çap</th>
                    <th className="p-2">Malzeme</th>
                    <th className="p-2">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {spools.map((spool, index) => (
                    <tr key={index}>
                      <td className="p-2">{spool.number}</td>
                      <td className="p-2">{spool.diameter}</td>
                      <td className="p-2">{spool.material}</td>
                      <td className="p-2">
                        <button onClick={() => handleRemoveSpool(index)} className="text-red-500">
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <input type="file" multiple onChange={handleExcelImport} />
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Proje Dökümanları</label>
                <input
                  type="file"
                  multiple
                  {...register('documents')}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-4">Barkod Yazdırma</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement barcode printing functionality
                      console.log('Print all barcodes');
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Tüm Barkodları Yazdır
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement selected barcode printing functionality
                      console.log('Print selected barcodes', spools);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Seçili Barkodları Yazdır
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Geri
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded ml-auto"
              >
                İleri
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded ml-auto"
              >
                Projeyi Oluştur
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}