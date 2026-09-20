import { checkAuth, loginWithGoogle } from './auth';
import { isSupabaseConfigured } from './supabase';
import { createIcons, Heart, ArrowLeft } from 'lucide';

// Se já estiver logado, redireciona para index.html
checkAuth(false);

createIcons({
  icons: {
    Heart,
    ArrowLeft,
  },
});

// Elementos da Interface
const googleBtn = document.getElementById('google-btn') as HTMLButtonElement;
const authAlert = document.getElementById('auth-alert') as HTMLDivElement;
const supabaseHint = document.getElementById('supabase-hint') as HTMLDivElement;

// Alerta de configuração do Supabase
if (!isSupabaseConfigured && supabaseHint) {
  supabaseHint.style.display = 'block';
}

// Alertas e Mensagens
function showAlert(message: string, type: 'error' | 'success' | 'warning'): void {
  authAlert.textContent = message;
  authAlert.className = `auth-alert ${type}`;
}

function hideAlert(): void {
  authAlert.style.display = 'none';
  authAlert.textContent = '';
}

// Tradução de Erros Comuns do Supabase
function translateSupabaseError(message: string): string {
  return message;
}

// Login com Google OAuth
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    hideAlert();
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        showAlert(translateSupabaseError(error.message), 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar login com Google.';
      showAlert(msg, 'error');
    }
  });
}
