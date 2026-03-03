// ==========================================
// 1. CONFIGURACIÓN Y PERSONALIDAD (SYSTEM PROMPT)
// ==========================================
const API_KEY = "AIzaSyD7RIKeugagToScoXcLbVBhT4ICnz18kYA"; 
const WHATSAPP_LINK = "https://wa.me/542613863563";

const SYSTEM_PROMPT = `
Eres LogiBot, el gemelo digital de Miguel Carrasquilla.
Tu especialidad es la Logística 4.0, Gestión Portuaria y Automatización de Datos.

REGLAS DE ORO:
1. No eres un bot aburrido. Eres un consultor experto.
2. Si hablan de "errores de stock", pregunta por su ERI o procesos de recepción.
3. Si mencionan "Excel", explica cómo usas Python para automatizar reportes.
4. Usa un lenguaje humano: "Entiendo lo frustrante que es...", "¡Esa es una gran pregunta!".
5. Cierra con valor: "Podemos analizar esto más a fondo en una breve llamada".
`;

// ==========================================
// 2. MOTOR DE INTELIGENCIA (CONEXIÓN CON GOOGLE)
// ==========================================

async function processIntent(userText) {
    try {
        // Usamos gemini-1.5-flash-latest que es la dirección más estable
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: SYSTEM_PROMPT + "\n\nUsuario: " + userText }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Detalle del error:", data.error.message);
            return "Error de Google: " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return "No pude procesar la respuesta, intenta de nuevo.";

    } catch (error) {
        return "Error de red: " + error.message;
    }
}
// ==========================================
// 3. INTERFAZ DINÁMICA (UI Y EFECTOS)
// ==========================================

function toggleChat() {
    const widget = document.getElementById('chat-widget');
    widget.classList.toggle('chat-hidden');
}

async function handleUserMsg() {
    const inputField = document.getElementById('chat-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    // Mostrar mensaje del usuario
    renderMessage(userText, 'user');
    inputField.value = '';

    // Crear burbuja de "Pensando..." con animación
    const tempBotId = "bot-loading-" + Date.now();
    renderMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot', tempBotId);

    // Llamada a la IA
    const aiResponse = await processIntent(userText);

    // Reemplazar la carga con el efecto de escritura humana
    const botDiv = document.getElementById(tempBotId);
    if (botDiv) {
        botDiv.innerHTML = ""; // Limpiamos los puntos
        typeWriterEffect(botDiv, aiResponse);
    }
}

// Efecto de escritura letra a letra
function typeWriterEffect(element, text) {
    let i = 0;
    const speed = 20; // Velocidad de escritura
    
    function type() {
        if (i < text.length) {
            let char = text.charAt(i);
            element.innerHTML += char === '\n' ? '<br>' : char;
            i++;
            setTimeout(type, speed);
            const body = document.getElementById('chat-body');
            body.scrollTop = body.scrollHeight;
        }
    }
    type();
}

function renderMessage(content, type, id = null) {
    const body = document.getElementById('chat-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    if (id) msgDiv.id = id;
    msgDiv.innerHTML = content;
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
}

// ==========================================
// 4. BOTONES RÁPIDOS Y EVENTOS
// ==========================================

async function handleQuickClick(tipo) {
    const prompts = {
        perfil: "Háblame de tu perfil profesional",
        tech: "¿Cómo aplicas Python en la logística?",
        experiencia: "Cuéntame tu experiencia en puertos",
        contacto: "¿Cómo te contacto?"
    };
    const text = prompts[tipo];
    renderMessage(text, 'user');
    
    const tempId = "bot-loading-" + Date.now();
    renderMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot', tempId);
    
    const aiRes = await processIntent(text);
    const botDiv = document.getElementById(tempId);
    if (botDiv) {
        botDiv.innerHTML = "";
        typeWriterEffect(botDiv, aiRes);
    }
}

function checkEnter(e) {
    if (e.key === 'Enter') handleUserMsg();
}