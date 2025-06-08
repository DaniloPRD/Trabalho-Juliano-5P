const API_BASE_URL = 'https://umfgcloud-autenticacao-service-7e27ead80532.herokuapp.com';

document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const signInButton = document.querySelector('#signIn');
    const signUpButton = document.querySelector('#signUp');
    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');
    const loginMessageEl = document.querySelector('#loginMessage');
    const registerMessageEl = document.querySelector('#registerMessage');

    const showMessage = (el, msg, isError = true) => {
        if (!el) return;
        el.textContent = msg;
        el.className = isError ? 'form-message error' : 'form-message success';
    };

    const parseApiError = (err) => {
        if (err?.message) return err.message;
        if (err?.errors) return Object.values(err.errors).flat().join(' ');
        if (typeof err === 'string') {
            try {
                const parsed = JSON.parse(err);
                if (parsed?.message) return parsed.message;
            } catch {}
            return err;
        }
        if (err?.title) return err.title;
        return "Ocorreu um erro desconhecido.";
    };

    const switchView = (view) => {
        if (body) body.className = view;
        showMessage(loginMessageEl, '');
        showMessage(registerMessageEl, '');
    };

    if (body) body.className = 'on-load';

    signInButton?.addEventListener('click', () => switchView('sign-in'));
    signUpButton?.addEventListener('click', () => switchView('sign-up'));

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage(registerMessageEl, '');

        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showMessage(registerMessageEl, "As senhas não coincidem!");
            return;
        }

        if (!email || !password) {
            showMessage(registerMessageEl, "Por favor, preencha e-mail, senha e confirmação de senha.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/Autenticacao/registar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, senha: password, senhaConfirmada: confirmPassword})
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (res.ok) {
                showMessage(registerMessageEl, data?.message || "Cadastro realizado com sucesso! Você será redirecionado para o login.", false);
                setTimeout(() => {
                    switchView('sign-in');
                    loginForm?.reset();
                    registerForm?.reset();
                    document.getElementById('loginEmail').value = email;
                    showMessage(loginMessageEl, "Cadastro efetuado! Faça o login para continuar.", false);
                }, 3000);
            } else {
                showMessage(registerMessageEl, parseApiError(data) || `Erro ${res.status}`);
            }
        } catch (err) {
            console.error("Registration error:", err);
            showMessage(registerMessageEl, "Erro de conexão ao tentar cadastrar. Verifique o console.");
        }
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage(loginMessageEl, '');

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showMessage(loginMessageEl, "Por favor, preencha e-mail e senha.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/Autenticacao/autenticar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, senha: password})
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (res.ok) {
                const {token, dataExpiracao} = data;
                if (token && dataExpiracao) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('tokenExpiry', new Date(dataExpiracao).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}));
                    window.location.href = 'principal.html';
                } else {
                    showMessage(loginMessageEl, "Resposta de login inválida. Token ou data de expiração não encontrados.");
                    console.warn("Login response missing token or expiration:", data);
                }
            } else {
                showMessage(loginMessageEl, parseApiError(data) || `Erro ${res.status}: Usuário ou senha inválidos.`);
            }
        } catch (err) {
            console.error("Login error:", err);
            showMessage(loginMessageEl, "Erro de conexão ao tentar fazer login. Verifique o console.");
        }
    });
        document.querySelectorAll('.toggle-password').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const input = document.querySelector(this.getAttribute('toggle'));
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

});
