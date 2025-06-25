"use client";

import { useState } from "react";
import IncomingMaterial from "../components/IncomingMaterial";
import OutgoingProduct from "../components/OutgoingProduct";
import OutgoingMaterial from "../components/OutgoingMaterial";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const TABS = [
  { key: "incoming", label: "Gelen Malzeme" },
  { key: "outgoing-product", label: "Giden Ürün" },
  { key: "outgoing-material", label: "Giden Malzeme" },
];

export default function NewShipmentPage() {
  const [activeTab, setActiveTab] = useState("incoming");

  return (
    <div className="p-6 w-full max-w-[900px] mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/shipments" className="mr-4 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Yeni Sevkiyat</h1>
      </div>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm p-6">
        {activeTab === "incoming" && <IncomingMaterial onBack={() => setActiveTab("")} />}
        {activeTab === "outgoing-product" && <OutgoingProduct onBack={() => setActiveTab("")} />}
        {activeTab === "outgoing-material" && <OutgoingMaterial onBack={() => setActiveTab("")} />}
      </div>
    </div>
  );
} 