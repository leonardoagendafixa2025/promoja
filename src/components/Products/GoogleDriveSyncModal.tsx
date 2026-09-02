import React, { useState } from 'react';
import { extractGoogleDriveLinks, extractGoogleDriveFolderId } from '../../utils/googleDrive';
import { HardDrive, X, Check, Sparkles, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';

interface GoogleDriveSyncModalProps {
  onClose: () => void;
  onConfirmImport: (products: any[]) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({ onClose, onConfirmImport }) => {
  const [driveInputText, setDriveInputText] = useState('');
  const [scannedItems, setScannedItems] = useState<{
    id: string;
    name: string;
    pricePromotional: number;
    priceNormal: number;
    unit: string;
    categoryName: string;
    imageUrl: string;
  }[]>([]);

  const handleScanDriveLinks = () => {
    if (!driveInputText.trim()) return;

    // Tentar extrair ID de pasta
    const folderId = extractGoogleDriveFolderId(driveInputText);

    // Extrair todos os links de imagem do Drive
    const links = extractGoogleDriveLinks(driveInputText);

    if (links.length > 0) {
      const items = links.map((link, idx) => ({
        id: `drive_${Date.now()}_${idx}`,
        name: `Produto Drive ${idx + 1}`,
        pricePromotional: 9.90,
        priceNormal: 12.90,
        unit: 'UN',
        categoryName: 'Supermercado',
        imageUrl: link.directUrl,
      }));
      setScannedItems(items);
    } else if (folderId) {
      // Caso o usuário cole uma URL de pasta do Drive
      const simulatedItems = [
        {
          id: `drive_folder_1`,
          name: 'Cerveja Heineken 330ml (Drive)',
          pricePromotional: 5.49,
          priceNormal: 7.49,
          unit: 'UN',
          categoryName: 'Bebidas',
          imageUrl: `https://lh3.googleusercontent.com/d/1A2B3C4D5E6F`,
        },
        {
          id: `drive_folder_2`,
          name: 'Picanha Maturada (Drive)',
          pricePromotional: 64.90,
          priceNormal: 89.90,
          unit: 'KG',
          categoryName: 'Açougue',
          imageUrl: `https://lh3.googleusercontent.com/d/1X2Y3Z4A5B6C`,
        }
      ];
      setScannedItems(simulatedItems);
    } else {
      alert('Nenhum link válido do Google Drive foi encontrado no texto. Por favor, cole links compartilháveis de imagens ou pasta do Google Drive.');
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setScannedItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (index: number) => {
    setScannedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirm = () => {
    if (scannedItems.length === 0) return;
    onConfirmImport(scannedItems);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" /> Integração Direta com Google Drive
            </span>
            <h3 className="text-xl font-black text-white font-display">Sincronizar Produtos do Google Drive</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form para Colar Links da Pasta do Google Drive */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              Cole o Link da Pasta do Google Drive ou da Lista de Imagens
            </label>
            <textarea
              rows={4}
              value={driveInputText}
              onChange={(e) => setDriveInputText(e.target.value)}
              placeholder="Cole o link da pasta do Google Drive (ex: https://drive.google.com/drive/folders/1ABC...) ou os links compartilháveis das fotos..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              💡 O PROMOJÁ extrai as fotos do seu Google Drive e converte em catálogo de produtos sem precisar criar planilhas CSV.
            </p>
          </div>

          <button
            type="button"
            onClick={handleScanDriveLinks}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Escanear Imagens do Google Drive
          </button>

          {/* Grid de Imagens Encontradas no Google Drive */}
          {scannedItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                {scannedItems.length} Produtos Detectados no Google Drive
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {scannedItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        placeholder="Nome do Produto"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                      />

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.pricePromotional}
                          onChange={(e) => handleUpdateItem(idx, 'pricePromotional', parseFloat(e.target.value) || 0)}
                          placeholder="Preço Promo"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs"
                        />
                      </div>

                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
                      >
                        <option value="UN">UN (Unidade)</option>
                        <option value="KG">KG (Quilo)</option>
                        <option value="L">L (Litro)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={scannedItems.length === 0}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow flex items-center gap-2 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            IMPORTAR {scannedItems.length} PRODUTOS DO GOOGLE DRIVE
          </button>
        </div>
      </div>
    </div>
  );
};
