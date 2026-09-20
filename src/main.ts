import { Item } from './types';
import { getStoredItems, saveStoredItems } from './storage';
import { checkAuth, logout, getCurrentUser, onAuthStateChange, loginWithGoogle } from './auth';
import {
  createIcons,
  Heart,
  Plus,
  ShoppingBag,
  Clock3,
  Check,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ImagePlus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  House,
  ArrowRight
} from 'lucide';

// Verifica autenticação (desativada temporariamente: REQUIRE_AUTH = false)
checkAuth(false);

// Estado da Aplicação
let items: Item[] = getStoredItems();
let currentTab: 'falta' | 'acabando' | 'comprados' = 'falta';
let searchQuery = '';
let selectedPriority = 'Todas';
let editingItem: Item | null = null;
let currentPhotoData = '';

// Elementos DOM
const sairBtn = document.getElementById('sair-btn') as HTMLButtonElement;
const googleHeaderBtn = document.getElementById('google-header-btn') as HTMLButtonElement;
const userDisplay = document.getElementById('user-display') as HTMLElement;
const infoBtn = document.getElementById('info-btn') as HTMLButtonElement;
const infoDialog = document.getElementById('info-dialog') as HTMLDivElement;
const closeInfoBtn = document.getElementById('close-info-btn') as HTMLButtonElement;

const statTotalEl = document.getElementById('stat-total') as HTMLElement;
const statPendingCountEl = document.getElementById('stat-pending-count') as HTMLElement;
const statMissingCountEl = document.getElementById('stat-missing-count') as HTMLElement;
const statBoughtCountEl = document.getElementById('stat-bought-count') as HTMLElement;

const tabFaltaBtn = document.getElementById('tab-falta') as HTMLButtonElement;
const tabAcabandoBtn = document.getElementById('tab-acabando') as HTMLButtonElement;
const tabCompradosBtn = document.getElementById('tab-comprados') as HTMLButtonElement;
const countFaltaEl = document.getElementById('count-falta') as HTMLElement;
const countAcabandoEl = document.getElementById('count-acabando') as HTMLElement;
const countCompradosEl = document.getElementById('count-comprados') as HTMLElement;

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const prioritySelect = document.getElementById('priority-select') as HTMLSelectElement;

const cardsContainer = document.getElementById('cards-container') as HTMLDivElement;
const emptyState = document.getElementById('empty-state') as HTMLDivElement;
const emptyTitleEl = document.getElementById('empty-title') as HTMLElement;
const emptyDescEl = document.getElementById('empty-desc') as HTMLElement;
const emptyActionBtn = document.getElementById('empty-action-btn') as HTMLButtonElement;

const listCountFooter = document.getElementById('list-count-footer') as HTMLElement;
const listTotalFooter = document.getElementById('list-total-footer') as HTMLElement;

const addItemBtn = document.getElementById('add-item-btn') as HTMLButtonElement;
const itemDialog = document.getElementById('item-dialog') as HTMLDivElement;
const itemForm = document.getElementById('item-form') as HTMLFormElement;
const dialogTitle = document.getElementById('dialog-title') as HTMLElement;
const cancelDialogBtn = document.getElementById('cancel-dialog-btn') as HTMLButtonElement;
const photoInput = document.getElementById('photo-input') as HTMLInputElement;
const photoPreviewContainer = document.getElementById('photo-preview-container') as HTMLDivElement;
const photoPreviewImg = document.getElementById('photo-preview-img') as HTMLImageElement;
const photoUploadText = document.getElementById('photo-upload-text') as HTMLElement;
const removePhotoBtn = document.getElementById('remove-photo-btn') as HTMLButtonElement;
const formErrorEl = document.getElementById('form-error') as HTMLElement;

const itemNameInput = document.getElementById('item-name') as HTMLInputElement;
const itemPriceInput = document.getElementById('item-price') as HTMLInputElement;
const itemPrioritySelect = document.getElementById('item-priority') as HTMLSelectElement;
const itemStatusSelect = document.getElementById('item-status') as HTMLSelectElement;
const itemUrlInput = document.getElementById('item-url') as HTMLInputElement;

// Formatador de Moeda
const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Renderização dos ícones Lucide
function refreshIcons(): void {
  createIcons({
    icons: {
      Heart,
      Plus,
      ShoppingBag,
      Clock3,
      Check,
      ArrowUpRight,
      Search,
      SlidersHorizontal,
      ImagePlus,
      Pencil,
      Trash2,
      RotateCcw,
      X,
      House,
      ArrowRight
    }
  });
}

// Atualiza Estatísticas no Topo
function updateStats(): void {
  const pending = items.filter(i => !i.bought);
  const totalPendingVal = pending.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const missingCount = pending.filter(i => i.priority === 'Não tenho').length;
  const boughtCount = items.filter(i => i.bought).length;

  if (statTotalEl) statTotalEl.textContent = formatCurrency(totalPendingVal);
  if (statPendingCountEl) statPendingCountEl.textContent = `${pending.length} desejos pendentes`;
  if (statMissingCountEl) statMissingCountEl.textContent = `${missingCount}`;
  if (statBoughtCountEl) statBoughtCountEl.textContent = `${boughtCount}`;

  // Contadores nas abas
  if (countFaltaEl) countFaltaEl.textContent = String(items.filter(i => !i.bought && i.status === 'falta').length);
  if (countAcabandoEl) countAcabandoEl.textContent = String(items.filter(i => !i.bought && i.status === 'acabando').length);
  if (countCompradosEl) countCompradosEl.textContent = String(boughtCount);
}

// Renderiza a Lista de Cards
function renderCards(): void {
  updateStats();

  const filtered = items.filter(i => {
    const tabMatch = currentTab === 'comprados' ? i.bought : (!i.bought && i.status === currentTab);
    const searchMatch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const priorityMatch = selectedPriority === 'Todas' || i.priority === selectedPriority;
    return tabMatch && searchMatch && priorityMatch;
  });

  cardsContainer.innerHTML = '';

  if (filtered.length === 0) {
    cardsContainer.style.display = 'none';
    emptyState.style.display = 'flex';

    if (searchQuery || selectedPriority !== 'Todas') {
      emptyTitleEl.textContent = 'Nenhum item por aqui';
      emptyDescEl.textContent = 'Tente ajustar sua busca ou selecionar outra prioridade.';
      emptyActionBtn.style.display = 'none';
    } else if (currentTab === 'comprados') {
      emptyTitleEl.textContent = 'Cada desejo realizado, um sorriso';
      emptyDescEl.textContent = 'Os itens marcados como realizados vão aparecer nesta seção.';
      emptyActionBtn.style.display = 'none';
    } else {
      emptyTitleEl.textContent = 'Toda listinha começa com um desejo';
      emptyDescEl.textContent = 'Adicione o primeiro item para começar a cuidar do que ela precisa.';
      emptyActionBtn.style.display = 'inline-flex';
    }
  } else {
    cardsContainer.style.display = 'grid';
    emptyState.style.display = 'none';

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'item-card';

      const mediaHtml = item.image
        ? `<img src="${item.image}" alt="${item.name}" class="card-img" />`
        : `<i data-lucide="shopping-bag" class="card-media-placeholder" style="width: 44px; height: 44px;"></i>`;

      const linkHtml = item.url
        ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="card-url-link">
             Ver produto <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i>
           </a>`
        : '';

      const toggleBtnClass = item.bought ? 'btn-outline' : 'btn-secondary';
      const toggleBtnIcon = item.bought ? 'rotate-ccw' : 'check';
      const toggleBtnText = item.bought ? 'Voltar para a lista' : 'Marcar como realizado';

      card.innerHTML = `
        <div class="card-media">
          ${mediaHtml}
          <span class="card-badge">${item.priority}</span>
        </div>
        <div class="card-body">
          <div class="card-header-row">
            <h3 class="card-title">${item.name}</h3>
            <div class="card-actions">
              <button class="btn-icon edit-btn" data-id="${item.id}" title="Editar ${item.name}">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-icon btn-danger delete-btn" data-id="${item.id}" title="Excluir ${item.name}">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </div>
          <div class="card-price">${formatCurrency(item.price)}</div>
          ${linkHtml}
          <button class="btn ${toggleBtnClass} card-toggle-btn toggle-bought-btn" data-id="${item.id}">
            <i data-lucide="${toggleBtnIcon}" style="width: 16px; height: 16px;"></i> ${toggleBtnText}
          </button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // Eventos dos botões do card
    cardsContainer.querySelectorAll('.toggle-bought-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const target = items.find(i => i.id === id);
        if (target) {
          target.bought = !target.bought;
          saveStoredItems(items);
          renderCards();
        }
      });
    });

    cardsContainer.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const target = items.find(i => i.id === id);
        if (target) openItemDialog(target);
      });
    });

    cardsContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const target = items.find(i => i.id === id);
        if (target && window.confirm(`Deseja realmente excluir "${target.name}"?`)) {
          items = items.filter(i => i.id !== id);
          saveStoredItems(items);
          renderCards();
        }
      });
    });
  }

  // Rodapé da Lista
  const totalVal = filtered.reduce((acc, curr) => acc + (curr.price || 0), 0);
  listCountFooter.textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'itens'} nesta lista`;
  listTotalFooter.innerHTML = `Total <strong>${formatCurrency(totalVal)}</strong>`;

  refreshIcons();
}

// Controle de Abas
function setTab(tab: 'falta' | 'acabando' | 'comprados'): void {
  currentTab = tab;
  [tabFaltaBtn, tabAcabandoBtn, tabCompradosBtn].forEach(btn => btn.classList.remove('active'));
  
  if (tab === 'falta') tabFaltaBtn.classList.add('active');
  if (tab === 'acabando') tabAcabandoBtn.classList.add('active');
  if (tab === 'comprados') tabCompradosBtn.classList.add('active');

  renderCards();
}

// Modal Adicionar / Editar Item
function openItemDialog(item: Item | null = null): void {
  editingItem = item;
  formErrorEl.textContent = '';
  
  if (item) {
    dialogTitle.textContent = 'Editar item';
    itemNameInput.value = item.name;
    itemPriceInput.value = item.price.toString();
    itemPrioritySelect.value = item.priority;
    itemStatusSelect.value = item.status;
    itemUrlInput.value = item.url || '';
    currentPhotoData = item.image || '';
  } else {
    dialogTitle.textContent = 'Um novo desejo dela';
    itemForm.reset();
    itemPrioritySelect.value = 'Acabando';
    itemStatusSelect.value = currentTab === 'acabando' ? 'acabando' : 'falta';
    currentPhotoData = '';
  }

  updatePhotoPreview();
  itemDialog.classList.add('open');
}

function closeItemDialog(): void {
  itemDialog.classList.remove('open');
  editingItem = null;
  currentPhotoData = '';
}

function updatePhotoPreview(): void {
  if (currentPhotoData) {
    photoPreviewImg.src = currentPhotoData;
    photoPreviewContainer.style.display = 'block';
    photoUploadText.textContent = 'Trocar foto';
    removePhotoBtn.style.display = 'inline-flex';
  } else {
    photoPreviewContainer.style.display = 'none';
    photoUploadText.textContent = 'Adicionar foto do produto';
    removePhotoBtn.style.display = 'none';
  }
}

// Eventos de Foto
photoInput.addEventListener('change', () => {
  const file = photoInput.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    formErrorEl.textContent = 'A imagem deve ter até 5 MB.';
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    formErrorEl.textContent = 'Formato inválido. Use JPG, PNG ou WebP.';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentPhotoData = String(reader.result);
    formErrorEl.textContent = '';
    updatePhotoPreview();
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener('click', () => {
  currentPhotoData = '';
  photoInput.value = '';
  updatePhotoPreview();
});

// Envio do Formulário do Item
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formErrorEl.textContent = '';

  const name = itemNameInput.value.trim();
  const price = parseFloat(itemPriceInput.value);
  const priority = itemPrioritySelect.value;
  const status = itemStatusSelect.value as 'falta' | 'acabando';
  const url = itemUrlInput.value.trim();

  if (!name) {
    formErrorEl.textContent = 'Informe o nome do item.';
    return;
  }

  if (isNaN(price) || price < 0) {
    formErrorEl.textContent = 'Informe um valor válido.';
    return;
  }

  if (url) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      formErrorEl.textContent = 'Insira um link válido começando com http:// ou https://';
      return;
    }
  }

  if (editingItem) {
    editingItem.name = name;
    editingItem.price = price;
    editingItem.priority = priority;
    editingItem.status = status;
    editingItem.url = url;
    editingItem.image = currentPhotoData;
    items = items.map(i => i.id === editingItem!.id ? editingItem! : i);
    setTab(editingItem.bought ? 'comprados' : editingItem.status);
  } else {
    const newItem: Item = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      price,
      priority,
      status,
      url,
      image: currentPhotoData,
      bought: false
    };
    items.push(newItem);
    setTab(newItem.status);
  }

  saveStoredItems(items);
  closeItemDialog();
});

// Eventos de Busca e Filtros
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderCards();
});

prioritySelect.addEventListener('change', () => {
  selectedPriority = prioritySelect.value;
  renderCards();
});

// Eventos de Abas
tabFaltaBtn.addEventListener('click', () => setTab('falta'));
tabAcabandoBtn.addEventListener('click', () => setTab('acabando'));
tabCompradosBtn.addEventListener('click', () => setTab('comprados'));

// Eventos de Modais
addItemBtn.addEventListener('click', () => openItemDialog());
emptyActionBtn.addEventListener('click', () => openItemDialog());
cancelDialogBtn.addEventListener('click', closeItemDialog);

itemDialog.addEventListener('click', (e) => {
  if (e.target === itemDialog) closeItemDialog();
});

// Modal "Nós dois"
infoBtn.addEventListener('click', () => {
  infoDialog.classList.add('open');
});

closeInfoBtn.addEventListener('click', () => {
  infoDialog.classList.remove('open');
});

infoDialog.addEventListener('click', (e) => {
  if (e.target === infoDialog) infoDialog.classList.remove('open');
});

import { supabase } from './supabase';

const mainContent = document.getElementById('main-content') as HTMLElement;
const pendingOverlay = document.getElementById('pending-overlay') as HTMLElement;
const rejectedOverlay = document.getElementById('rejected-overlay') as HTMLElement;
const adminPanelBtn = document.getElementById('admin-panel-btn') as HTMLButtonElement;
const adminDialog = document.getElementById('admin-dialog') as HTMLDivElement;
const closeAdminBtn = document.getElementById('close-admin-btn') as HTMLButtonElement;
const adminUsersList = document.getElementById('admin-users-list') as HTMLDivElement;

async function checkUserProfile(user: any) {
  if (!user) {
    if (mainContent) mainContent.style.display = 'block';
    if (pendingOverlay) pendingOverlay.style.display = 'none';
    if (rejectedOverlay) rejectedOverlay.style.display = 'none';
    if (adminPanelBtn) adminPanelBtn.style.display = 'none';
    return;
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) {
    // Se a tabela ainda não existir ou falhar, permite acesso temporário
    if (mainContent) mainContent.style.display = 'block';
    if (pendingOverlay) pendingOverlay.style.display = 'none';
    if (rejectedOverlay) rejectedOverlay.style.display = 'none';
    return;
  }

  if (profile.status === 'pending') {
    if (mainContent) mainContent.style.display = 'none';
    if (pendingOverlay) pendingOverlay.style.display = 'block';
    if (rejectedOverlay) rejectedOverlay.style.display = 'none';
    if (adminPanelBtn) adminPanelBtn.style.display = 'none';
  } else if (profile.status === 'rejected') {
    if (mainContent) mainContent.style.display = 'none';
    if (pendingOverlay) pendingOverlay.style.display = 'none';
    if (rejectedOverlay) rejectedOverlay.style.display = 'block';
    if (adminPanelBtn) adminPanelBtn.style.display = 'none';
  } else if (profile.status === 'approved') {
    if (mainContent) mainContent.style.display = 'block';
    if (pendingOverlay) pendingOverlay.style.display = 'none';
    if (rejectedOverlay) rejectedOverlay.style.display = 'none';
    
    if (profile.role === 'admin' && adminPanelBtn) {
      adminPanelBtn.style.display = 'inline-flex';
    } else if (adminPanelBtn) {
      adminPanelBtn.style.display = 'none';
    }
  }
}

// Sincronização do Usuário no Cabeçalho
async function updateUserHeader() {
  const user = await getCurrentUser();
  if (user && user.email) {
    userDisplay.textContent = user.email;
    userDisplay.style.display = 'inline-block';
    if (googleHeaderBtn) googleHeaderBtn.style.display = 'none';
    if (sairBtn) sairBtn.style.display = 'inline-flex';
  } else {
    userDisplay.style.display = 'none';
    if (googleHeaderBtn) googleHeaderBtn.style.display = 'inline-flex';
    if (sairBtn) sairBtn.style.display = 'none';
  }
  await checkUserProfile(user);
}

onAuthStateChange(async (user) => {
  if (user && user.email) {
    userDisplay.textContent = user.email;
    userDisplay.style.display = 'inline-block';
    if (googleHeaderBtn) googleHeaderBtn.style.display = 'none';
    if (sairBtn) sairBtn.style.display = 'inline-flex';
  } else {
    userDisplay.style.display = 'none';
    if (googleHeaderBtn) googleHeaderBtn.style.display = 'inline-flex';
    if (sairBtn) sairBtn.style.display = 'none';
  }
  await checkUserProfile(user);
});

// Ação do Botão Google no Cabeçalho
if (googleHeaderBtn) {
  googleHeaderBtn.addEventListener('click', async () => {
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        alert('Para usar o login com Google, ative o provedor no painel do Supabase (Authentication > Providers > Google).');
      }
    } catch (err: unknown) {
      console.error('Erro ao conectar com Google:', err);
    }
  });
}

// Logout
if (sairBtn) {
  sairBtn.addEventListener('click', async () => {
    await logout();
    await updateUserHeader();
  });
}

// Lógica do Painel Admin
async function loadAdminUsers() {
  if (!adminUsersList) return;
  adminUsersList.innerHTML = '<p style="text-align: center; color: var(--muted-foreground);">Carregando usuários...</p>';
  
  const { data: users, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  
  if (error) {
    adminUsersList.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar usuários.</p>';
    return;
  }
  
  if (!users || users.length === 0) {
    adminUsersList.innerHTML = '<p style="text-align: center; color: var(--muted-foreground);">Nenhum usuário encontrado.</p>';
    return;
  }

  adminUsersList.innerHTML = '';
  users.forEach((u: any) => {
    const userDiv = document.createElement('div');
    userDiv.style.display = 'flex';
    userDiv.style.justifyContent = 'space-between';
    userDiv.style.alignItems = 'center';
    userDiv.style.padding = '10px';
    userDiv.style.border = '1px solid var(--border)';
    userDiv.style.borderRadius = '8px';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${u.email}</strong> <br/> <span style="font-size: 0.75rem; color: var(--muted-foreground);">Status: ${u.status} | Papel: ${u.role}</span>`;
    
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    if (u.status !== 'approved') {
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Aprovar';
      approveBtn.className = 'btn btn-primary';
      approveBtn.style.padding = '4px 12px';
      approveBtn.style.fontSize = '0.75rem';
      approveBtn.onclick = () => updateUserStatus(u.id, 'approved');
      actions.appendChild(approveBtn);
    }

    if (u.status !== 'rejected' && u.role !== 'admin') {
      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Negar';
      rejectBtn.className = 'btn btn-danger';
      rejectBtn.style.padding = '4px 12px';
      rejectBtn.style.fontSize = '0.75rem';
      rejectBtn.onclick = () => updateUserStatus(u.id, 'rejected');
      actions.appendChild(rejectBtn);
    }

    userDiv.appendChild(info);
    userDiv.appendChild(actions);
    adminUsersList.appendChild(userDiv);
  });
}

async function updateUserStatus(userId: string, newStatus: string) {
  const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
  if (!error) {
    loadAdminUsers();
  } else {
    alert('Erro ao atualizar status: ' + error.message);
  }
}

if (adminPanelBtn) {
  adminPanelBtn.addEventListener('click', () => {
    if (adminDialog) adminDialog.classList.add('open');
    loadAdminUsers();
  });
}

if (closeAdminBtn) {
  closeAdminBtn.addEventListener('click', () => {
    if (adminDialog) adminDialog.classList.remove('open');
  });
}

if (adminDialog) {
  adminDialog.addEventListener('click', (e) => {
    if (e.target === adminDialog) adminDialog.classList.remove('open');
  });
}

// Inicialização
updateUserHeader();
setTab('falta');

