// Variables globales
let isCheckingSession = false;

function checkSession() {
    if (isCheckingSession) return;
    isCheckingSession = true;

    fetch('/check-session', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        //console.log('Estado de sesión:', data);
        if (data.loggedIn) {
            //console.log('Usuario autenticado');
        } else {
            //console.log('Sesión no válida o expirada');
        }
    })
    .catch(error => {
        console.error('Error al verificar la sesión:', error);
    });
}

function showLoginForm() {
    //console.log('Mostrando formulario de login');
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    if (loginContainer) loginContainer.style.display = 'block';
    if (mainContainer) mainContainer.style.display = 'none';
}

function showAppContent() {
    //console.log('Mostrando contenido de la aplicación');
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'block';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');

    console.log('Intento de inicio de sesión con email:', email);

    fetch('/api/auth/Authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Credenciales inválidas');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Login exitoso');
        // Guardar el token si es proporcionado por el backend
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        showAppContent();
        if (messageElement) {
            messageElement.textContent = 'Login exitoso';
            messageElement.style.color = 'green';
        }
    })
    .catch(error => {
        console.error('Error durante el login:', error);
        if (messageElement) {
            messageElement.textContent = error.message === 'Credenciales inválidas' 
                ? 'Login fallido. Por favor, verifica tus credenciales.' 
                : 'Ocurrió un error durante el login. Por favor, intenta de nuevo.';
            messageElement.style.color = 'red';
        }
    });
}

function handleLogout() {
    //console.log('Intento de logout');
    fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data.message);
        showLoginForm();
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    //console.log('DOM fully loaded');

    // Verificar sesión al cargar la página
    checkSession();

    // Añadir event listeners solo si el formulario está presente
    const loginForm = document.getElementById('login-form');
    //console.log('loginForm:', loginForm); // Añadir esto para depuración
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        //console.log('Event listener añadido al formulario de login');
    } else {
        console.error('Elemento login-form no encontrado');
    }
/*
    const logoutButton = document.querySelector('button[onclick="logout()"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        console.log('Event listener añadido al botón de logout');
    } else {
        console.error('Elemento botón de logout no encontrado');
    }
*/
    // Inicializar la aplicación si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
        showAppContent();
    } else {
        showLoginForm();
    }
});

// Funciones de manejo de sesiones y login
function checkSession() {
    // Verificación de sesión simplificada
}

function showLoginForm() {
    //console.log('Mostrando formulario de login');
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    if (loginContainer) loginContainer.style.display = 'block';
    if (mainContainer) mainContainer.style.display = 'none';
}

function showAppContent() {
    //console.log('Mostrando contenido de la aplicación');
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'block';
}

function handleLogout() {
    //console.log('Intento de logout');
    fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data.message);
        showLoginForm();
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
    });
}


    const mainContainer = document.getElementById('main-container');
    const loginContainer = document.getElementById('login-container');
    const messageElement = document.createElement('div');
    
    // File upload related elements
    const fileInput = document.getElementById('file-upload');
    const uploadButton = document.getElementById('upload-button');
    const conformButton = document.getElementById('conform-button');
    const convertJsonButton = document.getElementById('convert-json');
    const jsonFileInput = document.getElementById('json-upload');

    // Add CHECK LIST button event listener
    const checkListButton = document.getElementById('btnCheckList');
    if (checkListButton) {
        checkListButton.addEventListener('click', handleCheckListClick);
    } else {
        console.error('Elemento btnCheckList no encontrado');
    }

    // Add CHATGPT button event listener
    const chatgptButton = document.getElementById('btnChatGPT');
    if (chatgptButton) {
        chatgptButton.addEventListener('click', () => {
            window.open('https://chat.openai.com', '_blank');
        });
    } else {
        console.error('Elemento btnChatGPT no encontrado');
    }

    // Add CIPD button event listener
    const cipdButton = document.getElementById('btnCIPD');
    if (cipdButton) {
        cipdButton.addEventListener('click', activateCIPD);
    } else {
        console.error('Elemento btnCIPD no encontrado');
    }

    // Add event listeners
    if (fileInput) {
        fileInput.addEventListener('change', updateSelectedFilesMessage);
    } else {
        console.error('Elemento file-upload no encontrado');
    }

    if (uploadButton) {
        uploadButton.addEventListener('click', uploadPDFs);
    } else {
        console.error('Elemento upload-button no encontrado');
    }

    if (conformButton) {
        conformButton.addEventListener('click', handleConformClick);
    } else {
        console.error('Elemento conform-button no encontrado');
    }

    if (convertJsonButton) {
        convertJsonButton.addEventListener('click', convertJsonToExcel);
    } else {
        console.error('Elemento convert-json no encontrado');
    }

    if (jsonFileInput) {
        jsonFileInput.addEventListener('change', updateJsonSelectedMessage);
    } else {
        console.error('Elemento json-upload no encontrado');
    }

    if (loginContainer) {
        messageElement.id = 'login-message';
        loginContainer.appendChild(messageElement);
    } else {
        console.error('Elemento login-container no encontrado');
    }

    hideStep3Controls();
/*    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('El formulario de inicio de sesión no se encontró en el DOM');
    }
*/

// Función para manejar el envío del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Event listener añadido al formulario de login');
    } else {
        console.error('Elemento login-form no encontrado');
    }
});


    
    function handleCheckListClick() {
        //console.log('Botón Obtener el CheckList clickeado');
        const twoColumnLayout = document.querySelector('.two-column-layout');
        if (twoColumnLayout) twoColumnLayout.style.display = 'flex';
        
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        const action1 = document.getElementById('action1');
        const action2 = document.getElementById('action2');
        const action3 = document.getElementById('action3');
        const conformButton = document.getElementById('conform-button');
    
        // Mostrar PASOS 1 y 2
        if (step1) {
            step1.style.display = 'flex';
            step1.classList.add('active');
        }
        if (step2) {
            step2.style.display = 'flex';
            step2.classList.add('active');
        }
        if (action1) {
            action1.style.display = 'block';
            action1.classList.add('active');
        }
        if (action2) {
            action2.style.display = 'block';
            action2.classList.add('active');
        }
    
        // Ocultar PASO 3
        if (step3) {
            step3.style.display = 'none';
            step3.classList.remove('active');
        }
        if (action3) {
            action3.style.display = 'none';
            action3.classList.remove('active');
        }
    
        // Ocultar botón Conforme
        if (conformButton) {
            conformButton.style.display = 'none';
        }
    
        const importantNotice = document.getElementById('important-notice');
        if (importantNotice) importantNotice.style.display = 'none';
    
        // Aquí va tu lógica existente para el CheckList
        searchAndDeletePDFs();
    }

    function updateSelectedFilesMessage() {
        const fileInput = document.getElementById('file-upload');
        const messageSpan = document.getElementById('files-selected-message');
        if (fileInput && messageSpan) {
            const fileCount = fileInput.files.length;
            messageSpan.textContent = fileCount > 0 ? `${fileCount} archivo(s) seleccionado(s)` : '';
        } else {
            console.error('Elementos no encontrados para actualizar el mensaje de archivos seleccionados');
        }
    }

    function updateJsonSelectedMessage() {
        const fileInput = document.getElementById('json-upload');
        const messageElement = document.getElementById('json-files-selected-message');
        
        if (fileInput && messageElement) {
            const fileCount = fileInput.files.length;
            if (fileCount > 0) {
                messageElement.textContent = `${fileCount} archivo${fileCount > 1 ? 's' : ''} JSON seleccionado${fileCount > 1 ? 's' : ''}.`;
                messageElement.style.display = 'block';
            } else {
                messageElement.textContent = '';
                messageElement.style.display = 'none';
            }
        } else {
            console.error('Elementos no encontrados para actualizar el mensaje de archivos JSON seleccionados');
        }
    }

    function hideStep3Controls() {
        const action3Section = document.getElementById('action3');
        const jsonFileLabel = document.querySelector('label[for="json-upload"]');
        const convertJsonButton = document.getElementById('convert-json');
    
        if (action3Section) action3Section.style.display = 'none';
        if (jsonFileLabel) jsonFileLabel.style.display = 'none';
        if (convertJsonButton) convertJsonButton.style.display = 'none';
    }

    function handleConformClick() {
        console.log('Botón CONFORME clickeado');

        const importantNotice = document.getElementById('important-notice');
        if (importantNotice) importantNotice.style.display = 'none';
        activateStep(2);
        showStep3Controls();

        const step3Controls = document.getElementById('action3');
        if (step3Controls) {
            step3Controls.style.display = 'block';
            enableControls(step3Controls);
            const jsonUpload = document.getElementById('json-upload');
            const convertJson = document.getElementById('convert-json');
            if (jsonUpload) jsonUpload.disabled = false;
            if (convertJson) {
                convertJson.disabled = false;
                convertJson.classList.remove('disabled');
            }
        } else {
            console.error('Elemento action3 no encontrado');
        }
    }

    function showStep3Controls() {
        //console.log('Iniciando showStep3Controls');
        const action3Section = document.getElementById('action3');
        const jsonFileLabel = document.querySelector('label[for="json-upload"]');
        const convertJsonButton = document.getElementById('convert-json');
    
        //console.log('action3Section:', action3Section);
        //console.log('jsonFileLabel:', jsonFileLabel);
        //console.log('convertJsonButton:', convertJsonButton);
    
        if (action3Section) {
            action3Section.style.display = 'block';
            //console.log('action3Section display set to block');
        } else {
            //console.log('action3Section not found');
        }
        if (jsonFileLabel) {
            jsonFileLabel.style.display = 'inline-block';
            //console.log('jsonFileLabel display set to inline-block');
        } else {
            //console.log('jsonFileLabel not found');
        }
        if (convertJsonButton) {
            convertJsonButton.style.display = 'inline-block';
            //console.log('convertJsonButton display set to inline-block');
        } else {
            //console.log('convertJsonButton not found');
        }
        //console.log('Finalizando showStep3Controls');
    }

    async function searchAndDeletePDFs() {
        showProcessing(0);
        try {
            const response = await fetch('/api/search-delete-pdfs');
            const data = await response.json();
            hideProcessing(0);
            displayMessage('step1-message', data.message, data.foundFiles ? 'success' : 'info');
            enableUploadControls();
        } catch (error) {
            hideProcessing(0);
            displayMessage('step1-message', `Error: ${error.message}`, 'error');
        }
    }

    async function uploadPDFs() {
        //console.log('Iniciando función uploadPDFs');
        const fileInput = document.getElementById('file-upload');
        if (!fileInput) {
            console.error('Elemento file-upload no encontrado');
            return;
        }
        const files = fileInput.files;
        if (files.length === 0) {
            displayMessage('step2-message', 'Por favor, seleccione al menos un archivo PDF', 'error');
            return;
        }
    
        showProcessing(1);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('pdfs', files[i]);
        }
    
        try {
            //console.log('Enviando solicitud de subida');
            const response = await fetch('/api/upload-pdf', {
                method: 'POST',
                body: formData
            });
            //console.log('Respuesta recibida:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            //console.log('Datos recibidos:', data);
            hideProcessing(1);
            displayMessage('step2-message', data.message, 'success');
            
            if (data.success) {
                showCheckIcon('step1');
                //console.log('Mostrando check verde para PASO 1');
            }
    
            await generateLinksAndConvert();
        } catch (error) {
            console.error('Error en uploadPDFs:', error);
            hideProcessing(1);
            displayMessage('step2-message', `Error al subir los archivos PDF: ${error.message}`, 'error');
        }
    }

    async function generateLinksAndConvert() {
        showProcessing(1);
        try {
            const linksResponse = await fetch('/api/generate-pdf-links');
            const linksData = await linksResponse.json();
            if (!linksResponse.ok) {
                throw new Error(linksData.error || 'Error al generar enlaces');
            }
    
            displayMessage('step3-message', 'Enlaces generados. Iniciando conversión...', 'info');
    
            const convertResponse = await fetch('/api/convert-pdfs-to-text');
            if (!convertResponse.ok) {
                const errorData = await convertResponse.json();
                throw new Error(errorData.error || 'Error al convertir PDFs');
            }
    
            const blob = await convertResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'converted_texts_and_checklist.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
    
            hideProcessing(1);
            displayMessage('step4-message', 'PDFs convertidos a TXT. CHECKLIST creado. Descargados exitosamente', 'success');
            
            showCheckIcon('step2');
            //console.log('Mostrando check verde para PASO 2');
            disableStep2Controls();
            activateStep(2);

            const importantNotice = document.getElementById('important-notice');
            if (importantNotice) importantNotice.style.display = 'block';
        } catch (error) {
            hideProcessing(1);
            displayMessage('step4-message', `Error: ${error.message}`, 'error');
        }
    }

    async function convertJsonToExcel() {
        //console.log('Iniciando conversión de JSON a Excel');
        const fileInput = document.getElementById('json-upload');
        if (!fileInput) {
            console.error('Elemento json-upload no encontrado');
            return;
        }
        const file = fileInput.files[0];
        if (!file) {
            displayMessage('step5-message', 'Por favor, seleccione un archivo JSON', 'error');
            return;
        }
    
        showProcessing(4);
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('/api/json-to-excel', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'datos_convertidos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
    
            hideProcessing(4);
            
            disableStep3Controls();
            
            displaySuccessMessage();
            
            showCheckIcon('step3');
        } catch (error) {
            console.error('Error al convertir JSON a Excel:', error);
            hideProcessing(4);
            displayMessage('step5-message', `Error: ${error.message}`, 'error');
        }
    }

    function displayMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
        } else {
            console.error(`Elemento ${elementId} no encontrado`);
        }
    }

    function showProcessing(stepIndex) {
        const processingElement = document.getElementById(`processing${stepIndex + 1}`);
        if (processingElement) processingElement.style.display = 'block';
    }

    function hideProcessing(stepIndex) {
        const processingElement = document.getElementById(`processing${stepIndex + 1}`);
        if (processingElement) processingElement.style.display = 'none';
    }

    function disableStep2Controls() {
        const fileLabel = document.querySelector('label[for="file-upload"]');
        const uploadButton = document.getElementById('upload-button');
        const fileInput = document.getElementById('file-upload');
        
        if (fileLabel) {
            fileLabel.classList.add('disabled');
            fileLabel.style.pointerEvents = 'none';
        }
        if (uploadButton) {
            uploadButton.disabled = true;
        }
        if (fileInput) {
            fileInput.disabled = true;
        }
    }

    function activateStep(stepIndex) {
        //console.log(`Activando paso ${stepIndex + 1}`);
        const steps = ['step1', 'step2'];  // Removemos 'step3' de aquí
        steps.forEach((step, index) => {
            const stepElement = document.getElementById(step);
            const actionElement = document.getElementById(`action${index + 1}`);
            if (stepElement && actionElement) {
                if (index <= stepIndex) {
                    stepElement.classList.add('active');
                    actionElement.style.display = 'block';
                    if (index < stepIndex) {
                        disableControls(actionElement);
                    } else {
                        enableControls(actionElement);
                    }
                } else {
                    stepElement.classList.remove('active');
                    actionElement.style.display = 'none';
                }
            }
        });
        
        // Removemos la lógica específica para el PASO 3 de aquí
    }

    function activateCIPD() {
        //console.log('Activando PASO 3 (CIPD)');
        const twoColumnLayout = document.querySelector('.two-column-layout');
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        const action1 = document.getElementById('action1');
        const action2 = document.getElementById('action2');
        const step3Controls = document.getElementById('action3');
    
        if (twoColumnLayout) {
            twoColumnLayout.style.display = 'flex';
        }
    
        // Ocultar PASOS 1 y 2
        if (step1) {
            step1.style.display = 'none';
            step1.classList.remove('active');
        }
        if (step2) {
            step2.style.display = 'none';
            step2.classList.remove('active');
        }
        if (action1) {
            action1.style.display = 'none';
            action1.classList.remove('active');
        }
        if (action2) {
            action2.style.display = 'none';
            action2.classList.remove('active');
        }
    
        // Mostrar y activar solo PASO 3
        if (step3) {
            step3.style.display = 'flex';
            step3.classList.add('active');
            const step3Title = step3.querySelector('h3');
            if (step3Title) {
                step3Title.textContent = '3. Obtener Datos en Excel';
            }
        }
        
        if (step3Controls) {
            step3Controls.style.display = 'block';
            step3Controls.classList.add('active');
            
            //console.log('PASO 3 activado y controles habilitados');
            
            const jsonUpload = document.getElementById('json-upload');
            const convertJson = document.getElementById('convert-json');
            const jsonFileLabel = document.querySelector('label[for="json-upload"]');
            
            // Mostrar solo los controles relevantes para PASO 3
            if (jsonUpload) {
                jsonUpload.disabled = false;
                jsonUpload.style.display = 'inline-block';
            }
            
            if (convertJson) {
                convertJson.disabled = false;
                convertJson.style.display = 'inline-block';
            }
            
            if (jsonFileLabel) {
                jsonFileLabel.style.display = 'inline-block';
                jsonFileLabel.textContent = 'Elegir archivo JSON';
            }
            
            // Ocultar otros controles no relevantes para PASO 3
            const allControls = step3Controls.querySelectorAll('button, input, label');
            allControls.forEach(control => {
                if (control !== jsonUpload && control !== convertJson && control !== jsonFileLabel) {
                    control.style.display = 'none';
                }
            });
    
            //console.log('Controles del PASO 3 actualizados');
        } else {
            console.error('Elementos del PASO 3 no encontrados');
        }
    }

    function enableControls(element) {
        if (!element) return;
        const controls = element.querySelectorAll('button, input, select, label');
        controls.forEach(control => {
            if (control.tagName === 'LABEL') {
                control.classList.remove('disabled');
            } else {
                control.disabled = false;
            }
        });
    }

    function disableControls(element) {
        if (!element) return;
        const controls = element.querySelectorAll('button, input, select, label');
        controls.forEach(control => {
            if (control.tagName === 'LABEL') {
                control.classList.add('disabled');
            } else {
                control.disabled = true;
            }
        });
    }

    function showCheckIcon(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            const checkIcon = step.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.style.display = 'inline-block';
                checkIcon.style.color = 'green';
            } else {
                console.error(`Check icon not found for step ${stepId}`);
            }
        } else {
            console.error(`Elemento ${stepId} no encontrado`);
        }
    }

    function enableUploadControls() {
        const fileLabel = document.querySelector('label[for="file-upload"]');
        const uploadButton = document.getElementById('upload-button');
        const fileInput = document.getElementById('file-upload');
        
        if (fileLabel) {
            fileLabel.classList.remove('disabled');
            fileLabel.style.pointerEvents = 'auto';
        }
        if (uploadButton) {
            uploadButton.disabled = false;
        }
        if (fileInput) {
            fileInput.disabled = false;
        }
    }

    function disableStep3Controls() {
        const jsonFileLabel = document.querySelector('label[for="json-upload"]');
        const convertJsonButton = document.getElementById('convert-json');
        const jsonFileInput = document.getElementById('json-upload');
    
        if (jsonFileLabel) {
            jsonFileLabel.classList.add('disabled');
            jsonFileLabel.style.pointerEvents = 'none';
        }
        if (convertJsonButton) convertJsonButton.disabled = true;
        if (jsonFileInput) jsonFileInput.disabled = true;
    }
    
    function displaySuccessMessage() {
        const messageElement = document.getElementById('success-message');
        if (messageElement) {
            messageElement.textContent = '¡Felicidades! Has completado todo el proceso con éxito. El archivo Excel se ha descargado correctamente.';
            messageElement.style.display = 'block';
        } else {
            console.error('Elemento success-message no encontrado');
        }
    }

    function initializeApp() {

        const loginContainer = document.getElementById('login-container');
        const mainContainer = document.getElementById('main-container');
        const token = localStorage.getItem('token');
    
        if (token) {
            if (loginContainer) loginContainer.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'block';
            // Aquí puedes añadir cualquier otra lógica de inicialización para usuarios autenticados
        } else {
            if (loginContainer) loginContainer.style.display = 'block';
            if (mainContainer) mainContainer.style.display = 'none';
        }

        const uploadControls = document.getElementById('action1');
        if (uploadControls) disableControls(uploadControls);
        const searchDeleteBtn = document.getElementById('search-delete-pdfs');
        if (searchDeleteBtn) searchDeleteBtn.style.display = 'none';
        
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        const twoColumnLayout = document.querySelector('.two-column-layout');
        if (header) header.style.display = 'block';
        if (nav) nav.style.display = 'flex';
        if (twoColumnLayout) twoColumnLayout.style.display = 'none';
    }

    // Initialize the application if a token exists
    const token = localStorage.getItem('token');
    if (token) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'block';
        initializeApp();
    }
