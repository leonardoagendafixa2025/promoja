import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { parseGoogleDriveUrl, isGoogleDriveUrl } from '../../utils/googleDrive';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  FileSpreadsheet,
  HardDrive,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [parsedCsvProducts, setParsedCsvProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    if (!currentTenant) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/products?tenantId=${currentTenant.id}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentTenant]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant) return;

    try {
      setUploadingImage(true);
      setUploadSuccessMessage('');

      const base64Data = await readFileAsBase64(file);

      // Sincronizar e salvar imagem no repositório Google Drive da loja
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant.id,
          fileName: file.name,
          fileData: base64Data,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setEditingProduct(prev => ({
          ...prev,
          imageUrl: data.imageUrl,
        }));
        setUploadSuccessMessage('✨ Foto anexada e salva com sucesso no Google Drive!');
      }
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Falha ao enviar imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !editingProduct?.name || !editingProduct?.pricePromotional) return;

    const sanitizedImageUrl = parseGoogleDriveUrl(editingProduct.imageUrl || '');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          imageUrl: sanitizedImageUrl,
          tenantId: currentTenant.id,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        setUploadSuccessMessage('');
        fetchProducts();
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!currentTenant || !confirm('Deseja excluir este produto?')) return;
    try {
      const res = await fetch(`/api/products/${id}?tenantId=${currentTenant.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const items: any[] = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('produto')) return;
      const cols = line.split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        const rawImg = cols[5] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
        items.push({
          name: cols[0],
          priceNormal: parseFloat(cols[1].replace('R$', '').replace(',', '.')) || 0,
          pricePromotional: parseFloat(cols[2]?.replace('R$', '').replace(',', '.') || cols[1]?.replace('R$', '').replace(',', '.')) || 0,
          unit: cols[3] || 'UN',
          categoryName: cols[4] || 'Geral',
          imageUrl: parseGoogleDriveUrl(rawImg),
        });
      }
    });

    setParsedCsvProducts(items);
  };

  const handleConfirmBatchImport = async (importedItems?: any[]) => {
    const targetItems = importedItems || parsedCsvProducts;
    if (!currentTenant || targetItems.length === 0) return;
    try {
      const res = await fetch('/api/products/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant.id,
          products: targetItems,
        }),
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        setIsDriveSyncOpen(false);
        setCsvText('');
        setParsedCsvProducts([]);
        fetchProducts();
      }
    } catch (err) {
      console.error('Erro na importação em lote:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = Array.from(new Set(products.map(p => p.categoryName || 'Geral')));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-500" />
            Catálogo de Produtos & Banco de Imagens
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre os produtos enviando fotos salvas diretamente no <strong>Google Drive</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDriveSyncOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950/40 flex items-center gap-2 transition"
          >
            <HardDrive className="w-4 h-4 text-blue-200" />
            Sincronizar Pasta do Drive
          </button>

          <button
            onClick={() => {
              setCsvText('');
              setParsedCsvProducts([]);
              setIsImportModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Importar CSV
          </button>

          <button
            onClick={() => {
              setEditingProduct({
                name: '',
                brand: '',
                categoryName: 'Supermercado',
                priceNormal: 0,
                pricePromotional: 0,
                unit: 'UN',
                isHighlight: true,
                highlightTag: 'SUPER OFERTA',
                imageUrl: '',
              });
              setUploadSuccessMessage('');
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou marca..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({products.length})
          </button>
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Carregando produtos...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-400">Faça o upload de uma imagem do produto para salvar no Google Drive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const discount = p.priceNormal > p.pricePromotional
              ? Math.round(((p.priceNormal - p.pricePromotional) / p.priceNormal) * 100)
              : 0;

            const isDrive = isGoogleDriveUrl(p.imageUrl);
            const parsedImg = parseGoogleDriveUrl(p.imageUrl);

            return (
              <div key={p.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between p-4 relative">
                {discount > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider shadow z-10">
                    -{discount}% OFF
                  </span>
                )}

                {isDrive && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30 flex items-center gap-1 z-10 backdrop-blur">
                    <HardDrive className="w-3 h-3 text-blue-400" />
                    Google Drive
                  </span>
                )}

                <div className="space-y-3">
                  <div className="h-44 rounded-xl bg-slate-900/80 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={parsedImg}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      {p.categoryName || 'Geral'}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 mt-0.5">{p.name}</h3>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    {p.priceNormal > 0 && (
                      <span className="text-xs text-slate-500 line-through block">
                        De R$ {p.priceNormal.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className="text-lg font-black text-amber-400 font-display">
                      R$ {p.pricePromotional.toFixed(2).replace('.', ',')} <span className="text-xs font-semibold text-slate-400">/ {p.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastrar / Editar Produto com UPLOAD PARA GOOGLE DRIVE */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> Armazenamento em Nuvem Google Drive
                </span>
                <h3 className="text-lg font-bold text-white font-display">
                  {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ex: Cerveja Heineken Long Neck 330ml"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* UPLOAD DE IMAGEM PARA GOOGLE DRIVE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>Upload da Imagem do Produto *</span>
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> Salva no Google Drive
                  </span>
                </label>

                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-5 bg-slate-950/80 text-center transition flex flex-col items-center justify-center relative group">
                  {editingProduct.imageUrl ? (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <div className="w-32 h-32 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                        <img src={parseGoogleDriveUrl(editingProduct.imageUrl)} alt="Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Foto anexada e salva no Google Drive!
                      </span>
                      <p className="text-[10px] text-slate-500">Clique na caixa acima para alterar a foto se desejar.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-10 h-10 text-blue-400 mx-auto animate-bounce" />
                      <p className="text-xs font-bold text-white">Clique ou arraste a foto do produto aqui</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG ou WEBP • Envio direto para o Google Drive</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {uploadingImage && (
                  <div className="text-xs text-blue-400 font-bold flex items-center gap-2 pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    Enviando e salvando imagem no Google Drive...
                  </div>
                )}

                {uploadSuccessMessage && (
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-4 h-4" /> {uploadSuccessMessage}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Preço Normal (De)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.priceNormal || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceNormal: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Preço Promocional (Por) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.pricePromotional || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePromotional: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Categoria</label>
                  <input
                    type="text"
                    value={editingProduct.categoryName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryName: e.target.value })}
                    placeholder="Ex: Bebidas, Açougue, Mercearia"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Unidade</label>
                  <select
                    value={editingProduct.unit || 'UN'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilo (KG)</option>
                    <option value="L">Litro (L)</option>
                    <option value="PACK">Pack / Fardo</option>
                  </select>
                </div>
              </div>

              {/* CAMPO ALTERNATIVO DE URL MANUAL */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Ou cole o link do Google Drive (Opcional)
                </label>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/1ABC.../view"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 flex items-center gap-2 shadow disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sincronização Nativa com Google Drive */}
      {isDriveSyncOpen && (
        <GoogleDriveSyncModal
          onClose={() => setIsDriveSyncOpen(false)}
          onConfirmImport={(items) => handleConfirmBatchImport(items)}
        />
      )}

      {/* Modal de Importação CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Importar CSV / Planilha
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Cole o conteúdo da sua planilha com colunas: <strong className="text-white">produto, preco_antigo, preco_novo, unidade, categoria, link_imagem</strong>
              </p>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Cerveja Heineken 330ml, 7.49, 5.49, UN, Bebidas, https://drive.google.com/file/d/1ABC.../view"
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />

              <button
                type="button"
                onClick={handleParseCsv}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
              >
                Analisar Produtos da Planilha
              </button>

              {parsedCsvProducts.length > 0 && (
                <div className="space-y-2 border-t border-slate-800 pt-4 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-emerald-400">
                    {parsedCsvProducts.length} produtos analisados:
                  </p>
                  <div className="divide-y divide-slate-800 text-xs">
                    {parsedCsvProducts.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-center">
                        <span className="text-white font-semibold">{item.name}</span>
                        <span className="text-amber-400 font-bold">R$ {item.pricePromotional.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedCsvProducts.length === 0}
                onClick={() => handleConfirmBatchImport()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2 shadow"
              >
                <Check className="w-4 h-4" />
                Confirmar Importação de {parsedCsvProducts.length} Produtos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
