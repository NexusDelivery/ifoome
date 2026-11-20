import React, { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { DISH_CATEGORIES, INITIAL_DEMO_DISHES } from '../../data/demoData';
import { Dish, DishCategory } from '../../types/ifoome';
import { formatCurrency } from '../../utils/formatters';
import { ConfirmModal } from '../ConfirmModal';
import { DishImage } from '../DishImage';

interface AdminMenuProps {
  dishes: Dish[];
  onAddDish: (dish: Omit<Dish, 'id'>) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  onToggleAvailability,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | DishCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DishCategory>('Marmitas');
  const [priceInput, setPriceInput] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const filteredDishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return dishes.filter((dish) => {
      if (selectedCategory !== 'Todas' && dish.category !== selectedCategory) {
        return false;
      }
      if (!query) return true;
      return (
        dish.name.toLowerCase().includes(query) ||
        dish.ingredients.toLowerCase().includes(query)
      );
    });
  }, [dishes, selectedCategory, searchQuery]);

  const openNewForm = () => {
    setEditingDish(null);
    setName('');
    setCategory('Marmitas');
    setPriceInput('');
    setIngredients('');
    setDescription('');
    setImageUrl(INITIAL_DEMO_DISHES[0].imageUrl);
    setAvailable(true);
    setFormError(null);
    setAiNotice(null);
    setIsFormOpen(true);
  };

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish);
    setName(dish.name);
    setCategory(dish.category);
    setPriceInput(dish.price.toFixed(2).replace('.', ','));
    setIngredients(dish.ingredients);
    setDescription(dish.description);
    setImageUrl(dish.imageUrl);
    setAvailable(dish.available);
    setFormError(null);
    setAiNotice(null);
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Informe o nome do prato.');
      return;
    }

    const parsedPrice = Number(priceInput.replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Informe um preço válido maior que zero.');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      price: parsedPrice,
      ingredients: ingredients.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      available,
      isDemo: false,
    };

    if (editingDish) {
      onUpdateDish({ ...editingDish, ...payload });
    } else {
      onAddDish(payload);
    }

    setIsFormOpen(false);
  };

  const handleAiPlaceholderClick = () => {
    setAiNotice(
      'O assistente de IA para gerar descrições comerciais será ativado na próxima etapa (AI Builder). Por enquanto, você pode escrever ou editar a descrição manualmente.'
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] tracking-tight">
            Gerenciamento do Cardápio
          </h2>
          <p className="mt-1 text-sm text-[#263238]/75">
            Adicione pratos, ajuste preços ou pause itens com um toque quando acabar na cozinha.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewForm}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Adicionar prato</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('Todas')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'Todas'
                ? 'bg-[#287A55] text-white'
                : 'bg-white border border-[#DCE6E0] text-[#263238]/80 hover:bg-[#DDEFE3]/50'
            }`}
          >
            Todas ({dishes.length})
          </button>
          {DISH_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#287A55] text-white'
                  : 'bg-white border border-[#DCE6E0] text-[#263238]/80 hover:bg-[#DDEFE3]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search
            className="w-4 h-4 text-[#263238]/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produto..."
            aria-label="Buscar produto no cardápio administrativo"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCE6E0] text-sm text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#287A55]"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredDishes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE6E0] p-10 text-center">
          <p className="text-base font-bold text-[#263238]">
            Nenhum prato cadastrado nesta categoria.
          </p>
          <button
            type="button"
            onClick={openNewForm}
            className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143]"
          >
            Cadastrar primeiro prato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDishes.map((dish) => (
            <article
              key={dish.id}
              className={`bg-white rounded-2xl border p-4 flex gap-4 items-start transition-opacity ${
                dish.available
                  ? 'border-[#DCE6E0]'
                  : 'border-[#DCE6E0] bg-[#F6F9F7]/70 opacity-85'
              }`}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-[#F6F9F7] shrink-0">
                <DishImage
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#263238]/60">
                      {dish.category}
                    </p>
                    <h3 className="text-base font-bold text-[#263238] leading-snug truncate">
                      {dish.name}
                    </h3>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-[#287A55] tabular-nums shrink-0">
                    {formatCurrency(dish.price)}
                  </span>
                </div>

                <p className="text-xs text-[#263238]/70 line-clamp-2">
                  {dish.description || dish.ingredients || 'Sem descrição informada.'}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(dish.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      dish.available
                        ? 'bg-[#DDEFE3] border-[#287A55]/25 text-[#1E6143] hover:bg-[#CCE6D5]'
                        : 'bg-[#F4C95D]/30 border-[#F4C95D] text-[#263238] hover:bg-[#F4C95D]/45'
                    }`}
                  >
                    {dish.available ? (
                      <>
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Disponível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Indisponível</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(dish)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#DCE6E0] bg-white text-xs font-semibold text-[#263238] hover:bg-[#F6F9F7] inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(dish)}
                    aria-label={`Excluir ${dish.name}`}
                    className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de Adicionar / Editar Prato */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#263238]/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-form-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-[#DCE6E0] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6EFEA] flex items-center justify-between">
              <h3 id="dish-form-title" className="text-lg font-extrabold text-[#263238]">
                {editingDish ? 'Editar prato' : 'Adicionar novo prato'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Fechar formulário"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#263238]/65 hover:bg-[#F6F9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2.5 text-xs font-semibold text-[#991B1B]"
                >
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="dish-name"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Nome do prato *
                </label>
                <input
                  id="dish-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Marmita Parmegiana de Frango"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dish-category"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Categoria *
                  </label>
                  <select
                    id="dish-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DishCategory)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  >
                    {DISH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dish-price"
                    className="block text-sm font-semibold text-[#263238] mb-1.5"
                  >
                    Preço (R$) *
                  </label>
                  <input
                    id="dish-price"
                    type="text"
                    inputMode="decimal"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="25,90"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dish-ingredients"
                  className="block text-sm font-semibold text-[#263238] mb-1.5"
                >
                  Ingredientes principais
                </label>
                <input
                  id="dish-ingredients"
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Ex.: Filé de frango empanado, molho de tomate, queijo, arroz e purê"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="dish-description"
                    className="block text-sm font-semibold text-[#263238]"
                  >
                    Descrição comercial
                  </label>
                  <button
                    type="button"
                    onClick={handleAiPlaceholderClick}
                    className="px-2.5 py-1 rounded-lg bg-[#DDEFE3] text-[#1E6143] text-xs font-semibold hover:bg-[#CCE6D5] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sugerir com IA (Etapa 3)</span>
                  </button>
                </div>

                {aiNotice && (
                  <p className="mb-2 text-xs text-[#1E6143] bg-[#DDEFE3]/60 rounded-lg px-3 py-2">
                    {aiNotice}
                  </p>
                )}

                <textarea
                  id="dish-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o prato de forma apetitosa para seus clientes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE6E0] text-sm focus:outline-none focus:ring-2 focus:ring-[#287A55]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#263238] mb-1.5">
                  Fotografia do prato
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#F6F9F7] border border-[#DCE6E0] shrink-0">
                    <DishImage
                      src={imageUrl}
                      alt={name || 'Prévia'}
                      className="w-full h-full"
                    />
                  </div>
                  <label className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DCE6E0] bg-white text-xs font-semibold text-[#263238] hover:bg-[#F6F9F7] cursor-pointer inline-flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-[#287A55]" aria-hidden="true" />
                    <span>Escolher foto do celular</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={available}
                  onClick={() => setAvailable((prev) => !prev)}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[#DCE6E0] bg-[#F6F9F7] flex items-center justify-between text-sm font-semibold text-[#263238]"
                >
                  <span>Exibir imediatamente no cardápio público</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 ${
                      available
                        ? 'bg-[#287A55] text-white'
                        : 'bg-[#DCE6E0] text-[#263238]/75'
                    }`}
                  >
                    {available && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span>{available ? 'Disponível' : 'Pausado'}</span>
                  </span>
                </button>
              </div>

              <div className="pt-3 border-t border-[#E6EFEA] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DCE6E0] text-sm font-semibold text-[#263238]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#287A55] text-white text-sm font-semibold hover:bg-[#1E6143]"
                >
                  {editingDish ? 'Salvar alterações' : 'Adicionar prato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Excluir "${deleteTarget?.name || ''}"?`}
        description="O prato será removido do cardápio. Pedidos já registrados anteriormente não serão afetados."
        confirmLabel="Sim, excluir prato"
        cancelLabel="Manter prato"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteDish(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
