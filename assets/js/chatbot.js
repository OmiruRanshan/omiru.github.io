'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('chatbot-icon');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close');
  const sendBtn = document.getElementById('chatbot-send');
  const inputEl = document.getElementById('chatbot-input');
  const messagesEl = document.getElementById('chatbot-messages');
  const micBtn = document.getElementById('chatbot-mic');

  if (!icon || !container || !closeBtn || !sendBtn || !inputEl || !messagesEl || !micBtn) {
    return;
  }

  const storageKey = 'chatbot-history';
  const apiEndpoint = window.__CHATBOT_API_ENDPOINT__ || '/api/openai';
  const femaleVoiceHints = [
    'serena', 'samantha', 'maria', 'victoria', 'kendra', 'kathy', 'amy', 'jane',
    'olivia', 'amelia', 'arielle', 'megan', 'claire', 'zira', 'emma', 'ava',
    'female', 'girl', 'woman', 'lady'
  ];

  const siteKnowledge = {
    greeting: 'Hello. I can help with the portfolio, services, skills, education, contact details, or open related links.',
    contact: 'You can reach Omiru at omiruonline@gmail.com or 0772602443.',
    location: 'Omiru is based in Chilaw, Puttalam, Sri Lanka.',
    summary: 'Omiru Ranshan is a full stack developer, UI or UX designer, multimedia creator, graphic designer, content creator, 3D animator, video producer, audio engineer, game developer, and photographer.',
    skills: 'Core skills include HTML, CSS, JavaScript, TypeScript, React, Vue, Angular, Firebase, Bootstrap, Git, and design tooling such as Photoshop and Adobe XD.',
    services: 'Main services include web and app development, UI or UX design, game development, and videography with 3D animation.',
    education: 'Education includes a B.Sc. in Data Science and a Higher Diploma in Computer Engineering, plus multiple certifications.',
    portfolio: 'The site highlights recent work, services, skills, education, and a portfolio section with projects and news.'
  };

  let selectedVoice = null;
  let recognition = null;
  let recognizing = false;
  let isOpen = false;
  let history = loadHistory();

  function loadHistory() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(-12) : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history.slice(-12)));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function getVoiceScore(voice) {
    const name = (voice?.name || '').toLowerCase();
    const uri = (voice?.voiceURI || '').toLowerCase();
    const lang = (voice?.lang || '').toLowerCase();
    let score = 0;

    if (femaleVoiceHints.some((hint) => name.includes(hint) || uri.includes(hint))) score += 10;
    if (lang.startsWith('en')) score += 4;
    if (/female|woman|girl|lady/i.test(name)) score += 6;
    if (/male|man/i.test(name)) score -= 4;

    return score;
  }

  function chooseFemaleVoice(voices) {
    if (!voices.length) return null;
    return voices
      .slice()
      .sort((left, right) => getVoiceScore(right) - getVoiceScore(left))[0] || voices[0] || null;
  }

  function refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length) {
      selectedVoice = chooseFemaleVoice(voices);
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedVoice?.lang || 'en-US';
      utterance.rate = 0.98;
      utterance.pitch = 1.18;
      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      // Speech synthesis is optional.
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function setAriaState(open) {
    container.setAttribute('aria-hidden', open ? 'false' : 'true');
    container.classList.toggle('hidden', !open);
    icon.setAttribute('aria-expanded', open ? 'true' : 'false');
    icon.style.display = open ? 'none' : 'grid';
  }

  function openChat() {
    isOpen = true;
    setAriaState(true);
    setTimeout(() => inputEl.focus(), 0);

    if (!messagesEl.dataset.greeted) {
      messagesEl.dataset.greeted = '1';
      const greeting = 'Hello. I am your assistant. Type a message or use voice.';
      addMessage('bot', greeting);
      speak(greeting);
    }
  }

  function closeChat() {
    isOpen = false;
    if (recognition && recognizing) {
      try {
        recognition.stop();
      } catch (error) {
        // Ignore stop failures.
      }
    }
    setAriaState(false);
    stopSpeaking();
    icon.focus();
  }

  function extractIntent(text) {
    const value = text.toLowerCase();

    if (/\b(open|launch|go to)\s+(youtube|google|facebook|instagram)\b/.test(value)) {
      if (value.includes('youtube')) return { type: 'open', target: 'https://www.youtube.com', reply: 'Opening YouTube.' };
      if (value.includes('google')) return { type: 'open', target: 'https://www.google.com', reply: 'Opening Google.' };
      if (value.includes('facebook')) return { type: 'open', target: 'https://www.facebook.com', reply: 'Opening Facebook.' };
      if (value.includes('instagram')) return { type: 'open', target: 'https://www.instagram.com', reply: 'Opening Instagram.' };
    }

    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(value)) {
      return { type: 'greeting', reply: 'Hello. How can I help you today?' };
    }

    if (/\b(contact|email|phone|number|whatsapp|reach)\b/.test(value)) {
      return { type: 'contact', reply: siteKnowledge.contact };
    }

    if (/\b(where|location|based|from)\b/.test(value)) {
      return { type: 'location', reply: siteKnowledge.location };
    }

    if (/\b(who are you|about you|summary|profile|bio)\b/.test(value)) {
      return { type: 'summary', reply: siteKnowledge.summary };
    }

    if (/\b(skill|skills|stack|technology|technologies)\b/.test(value)) {
      return { type: 'skills', reply: siteKnowledge.skills };
    }

    if (/\b(service|services|offer|do you do|work)\b/.test(value)) {
      return { type: 'services', reply: siteKnowledge.services };
    }

    if (/\b(education|qualification|certification|study|school|college|university)\b/.test(value)) {
      return { type: 'education', reply: siteKnowledge.education };
    }

    if (/\b(portfolio|project|projects|recent work|news|events)\b/.test(value)) {
      return { type: 'portfolio', reply: siteKnowledge.portfolio };
    }

    return { type: 'fallback', reply: '' };
  }

  function buildContextPrompt(userText) {
    const recentTurns = history.slice(-6).map((entry) => `${entry.role}: ${entry.text}`).join('\n');
    return [
      'You are a concise, friendly portfolio assistant for Omiru Ranshan.',
      'Keep replies short, helpful, and natural.',
      'If the user asks about the portfolio, services, skills, education, contact details, or location, answer from the provided site knowledge.',
      'If the user asks to open a social or search site, give the action and keep the response short.',
      'Site knowledge:',
      siteKnowledge.summary,
      siteKnowledge.services,
      siteKnowledge.skills,
      siteKnowledge.education,
      siteKnowledge.contact,
      siteKnowledge.location,
      'Recent conversation:',
      recentTurns || 'none',
      `User: ${userText}`
    ].join('\n');
  }

  async function requestAiReply(userText) {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildContextPrompt(userText),
          message: userText,
          history: history.slice(-8)
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      const reply = data?.reply || data?.text || data?.message || data?.answer;
      return typeof reply === 'string' && reply.trim() ? reply.trim() : null;
    } catch (error) {
      return null;
    }
  }

  async function handleUserMessage(rawText) {
    const userText = rawText.trim();
    if (!userText) return;

    addMessage('user', userText);
    history.push({ role: 'user', text: userText });
    saveHistory();
    inputEl.value = '';

    const intent = extractIntent(userText);
    if (intent.type === 'open') {
      const reply = intent.reply || 'Opening link.';
      addMessage('bot', reply);
      history.push({ role: 'bot', text: reply });
      saveHistory();
      speak(reply);
      window.open(intent.target, '_blank', 'noopener,noreferrer');
      return;
    }

    const aiReply = await requestAiReply(userText);
    const reply = aiReply || intent.reply || buildFallbackReply(userText);

    addMessage('bot', reply);
    history.push({ role: 'bot', text: reply });
    saveHistory();
    speak(reply);
  }

  function buildFallbackReply(userText) {
    const value = userText.toLowerCase();

    if (value.includes('thank')) return 'You are welcome.';
    if (value.includes('price') || value.includes('cost') || value.includes('budget')) {
      return 'For pricing, share the project scope and I can help estimate the best direction.';
    }
    if (value.includes('hire') || value.includes('available')) {
      return 'Yes. The best way to reach Omiru is by email or WhatsApp.';
    }

    return 'I can help with skills, services, education, contact, location, or open links like YouTube and Google.';
  }

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.disabled = true;
      micBtn.title = 'Voice input not supported in this browser';
      micBtn.style.opacity = '0.45';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = selectedVoice?.lang || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognizing = true;
      micBtn.classList.add('listening');
      micBtn.setAttribute('aria-label', 'Stop voice input');
      micBtn.title = 'Listening... click to stop';
      addMessage('bot', 'Listening...');
      speak('Listening.');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      if (transcript) {
        handleUserMessage(transcript);
      }
    };

    const resetVoiceState = () => {
      recognizing = false;
      micBtn.classList.remove('listening');
      micBtn.setAttribute('aria-label', 'Start voice input');
      micBtn.title = 'Voice input';
    };

    recognition.onerror = () => {
      try {
        recognition.stop();
      } catch (error) {
        // Ignore stop failures.
      }
      resetVoiceState();
    };

    recognition.onend = resetVoiceState;

    micBtn.addEventListener('click', () => {
      if (!recognizing) {
        try {
          recognition.lang = selectedVoice?.lang || 'en-US';
          recognition.start();
        } catch (error) {
          // Ignore repeated start calls.
        }
      } else {
        try {
          recognition.stop();
        } catch (error) {
          // Ignore stop failures.
        }
      }
    });
  }

  function hydrateExistingMessages() {
    if (history.length) {
      messagesEl.innerHTML = '';
      history.forEach((entry) => addMessage(entry.role, entry.text));
      messagesEl.dataset.greeted = '1';
    }
  }

  icon.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', () => handleUserMessage(inputEl.value));
  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleUserMessage(inputEl.value);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeChat();
    }
  });

  icon.setAttribute('aria-expanded', 'false');
  container.setAttribute('aria-hidden', 'true');

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  hydrateExistingMessages();
  initSpeechRecognition();

  window.__chatbot = {
    openChat,
    closeChat,
    speak,
    refreshVoices
  };
});