// Chat Widget Script Modificado - Inicialização Direta
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #006633);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #006640);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #292929);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 102, 51, 0.15);
            border: 1px solid rgba(0, 102, 51, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-container.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-container.open { display: flex; flex-direction: column; }
        .n8n-chat-widget .brand-header { padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(0, 102, 51, 0.1); position: relative; }
        .n8n-chat-widget .close-button { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--chat--color-font); cursor: pointer; padding: 4px; font-size: 20px; opacity: 0.6; transition: opacity 0.2s; }
        .n8n-chat-widget .close-button:hover { opacity: 1; }
        .n8n-chat-widget .brand-header img { width: 32px; height: 32px; }
        .n8n-chat-widget .brand-header span { font-size: 18px; font-weight: 500; color: var(--chat--color-font); }
        .n8n-chat-widget .chat-messages { flex: 1; overflow-y: auto; padding: 20px; background: var(--chat--color-background); display: flex; flex-direction: column; }
        .n8n-chat-widget .chat-message { padding: 12px 16px; margin: 8px 0; border-radius: 12px; max-width: 80%; word-wrap: break-word; font-size: 14px; line-height: 1.5; }
        .n8n-chat-widget .chat-message.user { background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; align-self: flex-end; box-shadow: 0 4px 12px rgba(0, 102, 51, 0.2); }
        .n8n-chat-widget .chat-message.bot { background: #ECEFF1; border: 1px solid rgba(0, 102, 51, 0.1); color: var(--chat--color-font); align-self: flex-start; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .n8n-chat-widget .chat-input { padding: 16px; background: var(--chat--color-background); border-top: 1px solid rgba(0, 102, 51, 0.1); display: flex; gap: 8px; }
        .n8n-chat-widget .chat-input textarea { flex: 1; padding: 12px; border: 1px solid rgba(0, 102, 51, 0.2); border-radius: 8px; background: var(--chat--color-background); color: var(--chat--color-font); resize: none; font-family: inherit; font-size: 14px; }
        .n8n-chat-widget .chat-input button { background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; border-radius: 8px; padding: 0 20px; cursor: pointer; transition: transform 0.2s; font-family: inherit; font-weight: 500; }
        .n8n-chat-widget .chat-toggle { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 30px; background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 102, 51, 0.3); z-index: 999; transition: transform 0.3s; display: flex; align-items: center; justify-content: center; }
        .n8n-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-footer { padding: 8px; text-align: center; background: var(--chat--color-background); border-top: 1px solid rgba(0, 102, 51, 0.1); }
        .n8n-chat-widget .chat-footer a { color: var(--chat--color-primary); text-decoration: none; font-size: 12px; opacity: 0.8; transition: opacity 0.2s; }
    `;

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const config = window.ChatWidgetConfig || {};
    config.style = {
        primaryColor: '#006633',
        secondaryColor: '#006640',
        position: 'right',
        backgroundColor: '#ffffff',
        fontColor: '#292929',
        ...config.style
    };
    config.branding = {
        poweredBy: {
            text: 'DPDF Agente',
            link: 'https://www.defensoria.df.gov.br/'
        },
        ...config.branding
    };

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let conversationStarted = false; // Flag para controlar o início da conversa

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    
    // --- ALTERADO: HTML da interface de chat agora é o único conteúdo ---
    const chatInterfaceHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="Digite sua mensagem aqui..." rows="1"></textarea>
            <button type="submit">Enviar</button>
        </div>
        <div class="chat-footer">
            <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
        </div>
    `;
    
    chatContainer.innerHTML = chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    function generateUUID() { return crypto.randomUUID(); }

    async function startNewConversation() {
        currentSessionId = generateUUID();
        // Adiciona a mensagem de boas-vindas como a primeira mensagem do bot
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot';
        botMessageDiv.textContent = config.branding.welcomeText || "Olá! Como posso ajudar?";
        messagesContainer.appendChild(botMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message) {
        const messageData = { action: "sendMessage", sessionId: currentSessionId, route: config.webhook.route, chatInput: message, metadata: { userId: "" } };
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        try {
            const response = await fetch(config.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) });
            const data = await response.json();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) { console.error('Error:', error); }
    }
    
    sendButton.addEventListener('click', () => { const message = textarea.value.trim(); if (message) { sendMessage(message); textarea.value = ''; } });
    textarea.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const message = textarea.value.trim(); if (message) { sendMessage(message); textarea.value = ''; } } });
    
    // --- ALTERADO: Lógica de inicialização da conversa ---
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
        // Se a conversa ainda não começou e a janela está sendo aberta, inicie-a.
        if (!conversationStarted && chatContainer.classList.contains('open')) {
            startNewConversation();
            conversationStarted = true;
        }
    });

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => { button.addEventListener('click', () => { chatContainer.classList.remove('open'); }); });
})();