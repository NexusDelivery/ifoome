import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CATEGORIES, Category, Product } from '../../types';
import { PRESET_DISH_IMAGES } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';
import { generateDishDescription } from '../../services/aiService';
import { uploadProductImage } from '../../services/storageService';
import { DishImage } from '../DishImage';
import { ConfirmDialog } from '../ConfirmDialog';

interface AdminMenuProps {
  products: Product[];
  onSaveProduct: (
    product: Product,
    isNew: boolean,
    previousStoragePath?: string
  ) => Promise<void>;
  onToggleAvailability: (productId: string, nextAvailable: boolean) => Promise<void>;
  onDeleteProduct: (product: Product) => Promise<void>;
}

interface ProductFormState {
  id?: string;
  name: string;
  category: Category;
  priceText: string;
  ingredients: string;
  description: string;
  imageUrl: string;
  imageStoragePath?: string;
  previousStoragePath?: string;
  available: boolean;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  category: 'Marmitas',
  priceText: '',
  ingredients: '',
  description: '',
  imageUrl: PRESET_DISH_IMAGES[0].url,
  available: true,
};

export const AdminMenu: React.FC<AdminMenuProps> = ({
  products,
  onSaveProduct,
  onToggleAvailability,
  onDeleteProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | Category>('Todas');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.ingredients.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const openNewModal = () => {
    setForm({
      ...EMPTY_FORM,
      id: `prod-${Date.now()}`,
    });
    setFormError(null);
    setAiStatus(null);
    setAiLoading(false);
    setUploadingImage(false);
    setSaving(false);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      priceText: product.price.toFixed(2).replace('.', ','),
      ingredients: product.ingredients,
      description: product.description,
      imageUrl: product.imageUrl,
      imageStoragePath: product.imageStoragePath,
      previousStoragePath: product.imageStoragePath,
      available: product.available,
    });
    setFormError(null);
    setAiStatus(null);
    setAiLoading(false);
    setUploadingImage(false);
    setSaving(false);
    setModalOpen(true);
  };

  const isEditingExisting = Boolean(
    form.id && products.some((p) => p.id === form.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = form.name.trim();
    const parsedPrice = Number(form.priceText.replace(',', '.'));

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setFormError('Informe um nome válido para o prato (entre 2 e 120 caracteres).');
      return;
    }
    if (!CATEGORIES.includes(form.category)) {
      setFormError('Selecione uma categoria válida.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10000) {
      setFormError('Informe um preço válido entre R$ 0,01 e R$ 10.000,00.');
      return;
    }
    const trimmedImageUrl = form.imageUrl.trim();
    if (trimmedImageUrl.startsWith('data:')) {
      setFormError(
        'Envie a fotografia pelo botão "Enviar foto" (Firebase Storage) ou escolha uma URL/foto padrão para evitar arquivos pesados no banco.'
      );
      return;
    }
    if (/^(javascript|vbscript|file):/i.test(trimmedImageUrl)) {
      setFormError('Informe um endereço de imagem válido.');
      return;
    }

    const productId = form.id ?? `prod-${Date.now()}`;
    setSaving(true);
    try {
      await onSaveProduct(
        {
          id: productId,
          name: trimmedName,
          category: form.category,
          price: Math.round(parsedPrice * 100) / 100,
          ingredients: form.ingredients.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim(),
          imageStoragePath: form.imageStoragePath,
          available: form.available,
        },
        !isEditingExisting,
        form.previousStoragePath
      );
      setModalOpen(false);
    } catch {
      setFormError(
        'Não foi possível salvar o prato no Firebase. Verifique sua conexão e permissões.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    setAiStatus(null);

    if (form.name.trim().length < 2 || form.ingredients.trim().length < 3) {
      setAiStatus({
        type: 'error',
        message:
          'Preencha primeiro o Nome do prato e os Ingredientes principais para gerar a sugestão.',
      });
      return;
    }

    setAiLoading(true);
    const result = await generateDishDescription({
      name: form.name.trim(),
      ingredients: form.ingredients.trim(),
      category: form.category,
    });
    setAiLoading(false);

    if (!result.ok || !result.description) {
      setAiStatus({
        type: 'error',
        message:
          result.error ||
          'Não foi possível gerar a descrição agora. Você pode escrever manualmente.',
      });
      return;
    }

    setForm((prev) => ({ ...prev, description: result.description! }));
    setAiStatus({
      type: 'success',
      message:
        'Sugestão gerada! Revise ou edite o texto abaixo antes de salvar o prato.',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);
    setUploadingImage(true);

    const targetId = form.id ?? `prod-${Date.now()}`;
    try {
      const uploaded = await uploadProductImage(targetId, file);
      setForm((prev) => ({
        ...prev,
        id: targetId,
        imageUrl: uploaded.url,
        imageStoragePath: uploaded.storagePath,
      }));
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar a imagem para o Storage.'
      );
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Cardápio</h2>
          <p className="text-sm text-slate-400">
            Cadastre pratos, ajuste preços e pause itens esgotados em um toque.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Adicionar Prato</span>
        </button>
      </div>

      {/* Busca e Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filtrar cardápio por categoria"
        >
          {(['Todas', ...CATEGORIES] as const).map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prato..."
            aria-label="Buscar prato no cardápio"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <p className="font-display font-bold text-base text-white">
            Nenhum prato encontrado
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre um novo item ou altere o filtro de categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className={`group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700 ${
                product.available ? '' : 'opacity-75'
              }`}
            >
              <div>
                <DishImage src={product.imageUrl} alt={product.name} />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-orange-400/90 font-semibold uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span
                      className={`font-semibold ${
                        product.available ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                    {product.description || product.ingredients || 'Sem descrição informada.'}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-extrabold text-lg text-white tabular-nums">
                    {formatCurrency(product.price)}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={product.available}
                    onClick={() =>
                      void onToggleAvailability(product.id, !product.available)
                    }
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
                      product.available
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {product.available ? 'Pausar item' : 'Ativar item'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/70 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4 text-orange-400" aria-hidden="true" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(product)}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-red-500/40 text-xs sm:text-sm font-semibold text-red-300 hover:bg-red-500/15 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Adicionar / Editar Prato */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                id="product-form-title"
                className="font-display font-bold text-xl text-white"
              >
                {isEditingExisting ? 'Editar Prato' : 'Novo Prato'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar formulário de prato"
                className="min-w-[44px] min-h-[44px] -mr-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-sm font-medium text-red-200"
              >
                {formError}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="dish-name"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Nome do prato *
                </label>
                <input
                  id="dish-name"
                  type="text"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Marmita de Frango Grelhado"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="dish-category"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Categoria *
                  </label>
                  <select
                    id="dish-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Category })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dish-price"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Preço (R$) *
                  </label>
                  <input
                    id="dish-price"
                    type="text"
                    inputMode="decimal"
                    required
                    value={form.priceText}
                    onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                    placeholder="24,90"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dish-ingredients"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Ingredientes principais
                </label>
                <input
                  id="dish-ingredients"
                  type="text"
                  maxLength={400}
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  placeholder="Ex.: Arroz, feijão, frango grelhado e salada"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="dish-description"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Descrição comercial (editável)
                  </label>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAiDescription}
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-60 border border-orange-500/35 text-xs font-semibold text-orange-300 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                        <span>Gerar descrição com IA</span>
                      </>
                    )}
                  </button>
                </div>

                {aiStatus && (
                  <p
                    role={aiStatus.type === 'error' ? 'alert' : 'status'}
                    className={`mb-2 px-3 py-2 rounded-xl border text-xs ${
                      aiStatus.type === 'success'
                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                        : 'bg-amber-500/15 border-amber-500/35 text-amber-200'
                    }`}
                  >
                    {aiStatus.message}
                  </p>
                )}

                <textarea
                  id="dish-description"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o prato de forma apetitosa ou use o assistente de IA acima para sugerir um texto..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="dish-image"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Fotografia do prato (Firebase Storage ou URL)
                  </label>
                  <label
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer ${
                      uploadingImage ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" aria-hidden="true" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                        <span>Enviar foto</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_DISH_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageUrl: preset.url,
                          imageStoragePath: undefined,
                        })
                      }
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        form.imageUrl === preset.url
                          ? 'border-orange-500 bg-orange-500/15 text-orange-200'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  id="dish-image"
                  type="text"
                  maxLength={2048}
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      imageUrl: e.target.value,
                      imageStoragePath: undefined,
                    })
                  }
                  placeholder="URL da foto ou envie pelo botão acima (opcional)"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />

                {form.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-w-[200px]">
                    <DishImage src={form.imageUrl} alt={form.name || 'Prévia do prato'} />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded"
                />
                <span className="text-sm font-semibold text-slate-200">
                  Prato disponível para pedidos agora
                </span>
              </label>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {isEditingExisting ? 'Salvar Alterações' : 'Cadastrar Prato'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Excluir prato do cardápio?"
        description={`Tem certeza que deseja remover "${productToDelete?.name ?? ''}"? A foto associada no Storage também será removida, e pedidos já realizados continuam preservados.`}
        confirmLabel="Sim, excluir prato"
        destructive
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            void onDeleteProduct(productToDelete);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
};
