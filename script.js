// Verificar se o Firebase está carregado
if (typeof firebase === 'undefined') {
    console.error("Firebase não está carregado!");
} else {
    console.log("Firebase carregado.");
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado.");

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado.");

    // Inicializar Firebase Auth
    const auth = firebase.auth();

    // Elementos da página de autenticação
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const googleLoginBtn = document.getElementById('google-login');
    const appleLoginBtn = document.getElementById('apple-login');

    // Alternar para a página de cadastro
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Mostrando a página de cadastro.");
            document.getElementById('login-card').style.display = 'none';
            document.getElementById('signup-card').style.display = 'block';
        });
    }

    // Alternar para a página de login
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Mostrando a página de login.");
            document.getElementById('signup-card').style.display = 'none';
            document.getElementById('login-card').style.display = 'block';
        });
    }

    // Manipulação do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            console.log(`Tentando logar com: ${email}`);

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Login bem-sucedido.");
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error("Erro no login:", error);
                    alert(`Erro no login: ${error.message}`);
                });
        });
    }

    // Manipulação do formulário de cadastro
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const username = document.getElementById('signup-username').value;

            console.log(`Tentando cadastrar com: ${email}`);

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Atualizar o perfil do usuário com o nome de usuário
                    return userCredential.user.updateProfile({
                        displayName: username
                    });
                })
                .then(() => {
                    console.log("Cadastro bem-sucedido.");
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error("Erro no cadastro:", error);
                    alert(`Erro no cadastro: ${error.message}`);
                });
        });
    }

    // Manipulação do login com Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            console.log("Tentando logar com Google.");
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then((result) => {
                    console.log("Login com Google bem-sucedido.");
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error("Erro no login com Google:", error);
                    alert(`Erro no login com Google: ${error.message}`);
                });
        });
    }

    // Placeholder para login com Apple
    if (appleLoginBtn) {
        appleLoginBtn.addEventListener('click', () => {
            alert('Login com Apple ainda não implementado');
        });
    }

    // Verificar estado de autenticação
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuário logado:', user.email);
        } else {
            console.log('Nenhum usuário logado');
        }
    });

    // Funcionalidades da página home.html
    if (window.location.pathname.endsWith('home.html')) {
        console.log("Página home carregada.");

        // Atualizar o nome do usuário na página home
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                document.getElementById('user-name').textContent = user.displayName || user.email;
            } else {
                window.location.href = 'index.html';
            }
        });

        const logoutBtn = document.getElementById('logout-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const audioInput = document.getElementById('audio-input');
        const fileName = document.getElementById('file-name');
        const processBtn = document.getElementById('process-btn');
        const playerSection = document.querySelector('.player-section');
        const audioPlayer = document.getElementById('audio-player');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const seekSlider = document.getElementById('seek-slider');
        const currentTime = document.getElementById('current-time');
        const duration = document.getElementById('duration');

        // Função de logout
        logoutBtn.addEventListener('click', () => {
            console.log("Tentando fazer logout.");
            auth.signOut()
                .then(() => {
                    console.log("Logout bem-sucedido.");
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Erro ao fazer logout:', error);
                });
        });

        // Função para clicar no botão de upload
        uploadBtn.addEventListener('click', () => {
            audioInput.click();
        });

        // Exibir o nome do arquivo selecionado
        audioInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileName.textContent = e.target.files[0].name;
                processBtn.disabled = false;
                console.log(`Arquivo selecionado: ${e.target.files[0].name}`);
            }
        });

        // Função para processar o áudio
        processBtn.addEventListener('click', () => {
            const selectedInstruments = Array.from(document.querySelectorAll('.instrument-options input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            console.log(`Instrumentos selecionados para remover: ${selectedInstruments}`);

            processAudioWithColab(audioInput.files[0], selectedInstruments);
        });

        // Controles do player de áudio
        playPauseBtn.addEventListener('click', togglePlayPause);
        audioPlayer.addEventListener('timeupdate', updateSeekBar);
        audioPlayer.addEventListener('loadedmetadata', () => {
            duration.textContent = formatTime(audioPlayer.duration);
            seekSlider.max = audioPlayer.duration;
        });
        seekSlider.addEventListener('input', seekTo);

        function togglePlayPause() {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                console.log("Reproduzindo áudio.");
            } else {
                audioPlayer.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                console.log("Pausando áudio.");
            }
        }

        function updateSeekBar() {
            seekSlider.value = audioPlayer.currentTime;
            currentTime.textContent = formatTime(audioPlayer.currentTime);
        }

        function seekTo() {
            audioPlayer.currentTime = seekSlider.value;
            console.log(`Seek para ${seekSlider.value} segundos.`);
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function showLoadingOverlay() {
            document.getElementById('loading-overlay').style.display = 'flex';
        }

        function hideLoadingOverlay() {
            document.getElementById('loading-overlay').style.display = 'none';
        }

        // Função para processar áudio com o Colab
        async function processAudioWithColab(audioFile, instruments) {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('instruments', JSON.stringify(instruments));

            try {
                showLoadingOverlay();
                const response = await fetch('https://5bd2-35-245-36-135.ngrok-free.app', { // Substitua pela URL pública do seu Colab
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Erro ao processar o áudio');
                }

                const processedAudioBlob = await response.blob();
                const processedAudioUrl = URL.createObjectURL(processedAudioBlob);

                audioPlayer.src = processedAudioUrl;
                playerSection.style.display = 'block';
                console.log("Áudio processado com sucesso.");
            } catch (error) {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao processar o áudio. Por favor, tente novamente.');
            } finally {
                hideLoadingOverlay();
            }
        }
    }
});