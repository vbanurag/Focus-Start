document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateGreeting();
    setInterval(updateTime, 1000);

    setBackground();
    loadFocus();
    loadQuote();

    const focusInput = document.getElementById('focus-input');
    focusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setFocus(e.target.value);
        }
    });

    const focusCheck = document.getElementById('focus-check');
    focusCheck.addEventListener('change', (e) => {
        toggleFocusComplete(e.target.checked);
    });

    const focusDelete = document.getElementById('focus-delete');
    focusDelete.addEventListener('click', deleteFocus);

    // Wallpaper Refresh
    document.getElementById('refresh-bg').addEventListener('click', () => {
        setBackground(true);
    });

    // Quote Refresh
    document.getElementById('refresh-quote').addEventListener('click', () => {
        const quoteText = document.getElementById('quote-text');
        quoteText.style.opacity = '0.5';
        loadQuote(true).then(() => {
            quoteText.style.opacity = '1';
        });
    });

    // Todo Feature
    initTodo();

    // Weather Feature
    initWeather();

    // Hacker News Feature
    initHN();
});

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`; // 24hr format for simplicity, can toggle
    document.getElementById('clock').textContent = timeString;
}

function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Good evening';

    if (hours >= 5 && hours < 12) {
        greeting = 'Good morning';
    } else if (hours >= 12 && hours < 18) {
        greeting = 'Good afternoon';
    }

    document.getElementById('greeting-text').textContent = greeting;

    // Name Handling
    const nameEl = document.getElementById('name-text');
    const savedName = localStorage.getItem('focus_name');

    if (savedName) {
        nameEl.textContent = savedName;
    }

    // Clear "User" on focus for easier editing
    nameEl.addEventListener('focus', () => {
        if (nameEl.textContent === 'User') {
            nameEl.textContent = '';
        }
    });

    // Save on blur (focus lost)
    nameEl.addEventListener('blur', () => {
        let newName = nameEl.textContent.trim();
        // If empty, try to get from storage, else default to 'User'
        if (!newName) {
            newName = localStorage.getItem('focus_name') || 'User';
        }

        // Save effectively
        if (newName !== 'User') {
            localStorage.setItem('focus_name', newName);
        }

        nameEl.textContent = newName;
    });

    // Save on Enter key and blur
    nameEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameEl.blur();
        }
    });
}

async function setBackground(forceNew = false) {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('bg_date');
    const savedUrl = localStorage.getItem('bg_url');

    if (!forceNew && savedDate === today && savedUrl) {
        document.body.style.backgroundImage = `url('${savedUrl}')`;
        return;
    }

    try {
        // Fetch a random nature-like image from Picsum
        // We use fetch to get the final redirected URL
        const response = await fetch('https://picsum.photos/1920/1080'); // Standard HD resolution
        if (response.ok) {
            const bgUrl = response.url;

            // Preload
            const img = new Image();
            img.src = bgUrl;
            img.onload = () => {
                document.body.style.backgroundImage = `url('${bgUrl}')`;
                localStorage.setItem('bg_url', bgUrl);
                localStorage.setItem('bg_date', today);
            };
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.error('Wallpaper fetch failed, using fallback:', error);
        setFallbackBackground();
    }
}

function setFallbackBackground() {
    const backgrounds = [
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80'
    ];
    const index = Math.floor(Math.random() * backgrounds.length);
    document.body.style.backgroundImage = `url('${backgrounds[index]}')`;
}

function loadFocus() {
    const focus = localStorage.getItem('focus_focus');
    const completed = localStorage.getItem('focus_focus_completed') === 'true';

    if (focus) {
        showFocusDisplay(focus, completed);
    }
}

function setFocus(text) {
    if (!text.trim()) return;
    localStorage.setItem('focus_focus', text);
    localStorage.setItem('focus_focus_completed', 'false');
    showFocusDisplay(text, false);
    document.getElementById('focus-input').value = '';
}

function showFocusDisplay(text, completed) {
    document.getElementById('focus-input').style.display = 'none';
    document.querySelector('.focus-container h3').innerText = 'TODAY';

    const display = document.getElementById('focus-display');
    const textSpan = document.getElementById('focus-text');
    const checkbox = document.getElementById('focus-check');

    display.classList.remove('hidden');
    textSpan.innerText = text;
    checkbox.checked = completed;

    if (completed) {
        textSpan.classList.add('completed');
    } else {
        textSpan.classList.remove('completed');
    }
}

function toggleFocusComplete(checked) {
    localStorage.setItem('focus_focus_completed', checked);
    const textSpan = document.getElementById('focus-text');
    if (checked) {
        textSpan.classList.add('completed');
    } else {
        textSpan.classList.remove('completed');
    }
}

function deleteFocus() {
    localStorage.removeItem('focus_focus');
    localStorage.removeItem('focus_focus_completed');

    document.getElementById('focus-display').classList.add('hidden');
    document.getElementById('focus-input').style.display = 'block';
    document.querySelector('.focus-container h3').innerText = 'What is your main focus for today?';
}

async function loadQuote(forceNew = false) {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quote_date');
    const savedQuote = localStorage.getItem('quote_text');
    const savedAuthor = localStorage.getItem('quote_author');

    if (!forceNew && savedDate === today && savedQuote) {
        document.getElementById('quote-text').innerText = `“${savedQuote}”`;
        document.getElementById('quote-author').innerText = savedAuthor;
        return;
    }

    try {
        const response = await chrome.runtime.sendMessage({ type: 'FETCH_QUOTE' });

        if (response.success) {
            const data = response.data;
            const quote = { text: data.quote, author: data.author };

            document.getElementById('quote-text').innerText = `“${quote.text}”`;
            document.getElementById('quote-author').innerText = quote.author;

            localStorage.setItem('quote_text', quote.text);
            localStorage.setItem('quote_author', quote.author);
            localStorage.setItem('quote_date', today);
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Quote fetch failed, using fallback:', error);
        loadFallbackQuote();
    }
}

function loadFallbackQuote() {
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ];

    const index = Math.floor(Math.random() * quotes.length);
    const quote = quotes[index];

    document.getElementById('quote-text').innerText = `“${quote.text}”`;
    document.getElementById('quote-author').innerText = quote.author;
}

// Todo Logic
function initTodo() {
    const todoToggle = document.getElementById('todo-toggle');
    const todoPanel = document.getElementById('todo-panel');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Load todos
    renderTodos();

    // Load panel state
    const isTodoOpen = localStorage.getItem('focus_todo_open') === 'true';
    if (isTodoOpen) {
        todoPanel.classList.remove('hidden');
    } else {
        todoPanel.classList.add('hidden');
    }

    // Toggle Panel
    todoToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = todoPanel.classList.toggle('hidden');
        localStorage.setItem('focus_todo_open', !isHidden);
    });

    // Close panel logic removed to allow user to choose when to open/close explicitly
    // document.addEventListener('click', (e) => { ... });

    // Add Todo
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
            addTodo(e.target.value.trim());
            e.target.value = '';
        }
    });
}

function getTodos() {
    const todos = localStorage.getItem('focus_todos');
    return todos ? JSON.parse(todos) : [];
}

function saveTodos(todos) {
    localStorage.setItem('focus_todos', JSON.stringify(todos));
}

function addTodo(text) {
    const todos = getTodos();
    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    saveTodos(todos);
    renderTodos();
}

function toggleTodo(id) {
    const todos = getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos[index].completed = !todos[index].completed;
        saveTodos(todos);
        renderTodos();
    }
}

function deleteTodo(id) {
    const todos = getTodos();
    const newTodos = todos.filter(t => t.id !== id);
    saveTodos(newTodos);
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const todos = getTodos();

    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = `todo-text ${todo.completed ? 'completed' : ''}`;
        span.innerText = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete';
        deleteBtn.innerText = '×'; // or use an icon
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggling if we click delete (though layout separates them)
            deleteTodo(todo.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);


        todoList.appendChild(li);
    });
}

// Weather Feature
function initWeather() {
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherLocation = document.getElementById('weather-location');
    const weatherDesc = document.getElementById('weather-desc');

    if (!navigator.geolocation) {
        weatherDesc.textContent = 'Geolocation not supported';
        weatherDesc.classList.remove('hidden');
        return;
    }

    // Check for cached data first to avoid unnecessary API calls
    const cachedWeather = localStorage.getItem('focus_weather');
    if (cachedWeather) {
        const data = JSON.parse(cachedWeather);
        // Refresh if older than 1 hour
        if (Date.now() - data.timestamp < 3600000) {
            updateWeatherUI(data);
        } else {
            fetchWeather();
        }
    } else {
        fetchWeather();
    }

    function fetchWeather() {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                // Parallel fetch for weather and location
                // Open-Meteo API (No auth required)
                const weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                // BigDataCloud Reverse Geocoding (No auth required for client-side)
                const locationPromise = fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);

                const [weatherRes, locationRes] = await Promise.all([weatherPromise, locationPromise]);
                const weatherData = await weatherRes.json();
                const locationData = await locationRes.json();

                if (weatherData.current_weather) {
                    const data = {
                        temp: weatherData.current_weather.temperature,
                        code: weatherData.current_weather.weathercode,
                        city: locationData.city || locationData.locality || 'Unknown',
                        timestamp: Date.now()
                    };

                    localStorage.setItem('focus_weather', JSON.stringify(data));
                    updateWeatherUI(data);
                }
            } catch (error) {
                console.error('Weather/Location fetch error:', error);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            weatherDesc.textContent = 'Loc access denied';
            weatherDesc.classList.remove('hidden');
        });
    }

    function updateWeatherUI(data) {
        weatherTemp.textContent = `${Math.round(data.temp)}°C`;
        const { icon, label } = getWeatherInfo(data.code);
        weatherIcon.textContent = icon;
        weatherIcon.title = label;
        if (data.city) {
            weatherLocation.textContent = data.city;
        }
    }
}

function getWeatherInfo(code) {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const codes = {
        0: { icon: '☀️', label: 'Clear sky' },
        1: { icon: '🌤️', label: 'Mainly clear' },
        2: { icon: '⛅', label: 'Partly cloudy' },
        3: { icon: '☁️', label: 'Overcast' },
        45: { icon: '🌫️', label: 'Fog' },
        48: { icon: '🌫️', label: 'Depositing rime fog' },
        51: { icon: '🌦️', label: 'Light drizzle' },
        53: { icon: '🌦️', label: 'Moderate drizzle' },
        55: { icon: '🌧️', label: 'Dense drizzle' },
        61: { icon: '🌧️', label: 'Slight rain' },
        63: { icon: '🌧️', label: 'Moderate rain' },
        65: { icon: '🌧️', label: 'Heavy rain' },
        71: { icon: '🌨️', label: 'Slight snow' },
        73: { icon: '🌨️', label: 'Moderate snow' },
        75: { icon: '❄️', label: 'Heavy snow' },
        77: { icon: '🌨️', label: 'Snow grains' },
        80: { icon: '🌦️', label: 'Slight rain showers' },
        81: { icon: '🌧️', label: 'Moderate rain showers' },
        82: { icon: '🌧️', label: 'Violent rain showers' },
        85: { icon: '🌨️', label: 'Slight snow showers' },
        86: { icon: '❄️', label: 'Heavy snow showers' },
        95: { icon: '⛈️', label: 'Thunderstorm' },
        96: { icon: '⛈️', label: 'Thunderstorm with slight hail' },
        99: { icon: '⛈️', label: 'Thunderstorm with heavy hail' }
    };

    return codes[code] || { icon: '🌡️', label: 'Unknown' };
}

// Hacker News Feature
function initHN() {
    const hnList = document.getElementById('hn-list');
    const refreshBtn = document.getElementById('refresh-hn');

    loadStories();

    refreshBtn.addEventListener('click', () => {
        hnList.innerHTML = '<li>Refreshing...</li>';
        loadStories(true);
    });

    async function loadStories(forceRefresh = false) {
        const cached = localStorage.getItem('focus_hn_cache');
        if (!forceRefresh && cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 600000) { // 10 minutes cache
                renderStories(data.stories);
                return;
            }
        }

        try {
            // Fetch top 500 IDs, take top 5
            const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
            const ids = await response.json();
            const top5Ids = ids.slice(0, 5);

            const storyPromises = top5Ids.map(id =>
                fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(res => res.json())
            );

            const stories = await Promise.all(storyPromises);

            const simplifiedStories = stories.map(s => ({
                title: s.title,
                url: s.url || `https://news.ycombinator.com/item?id=${s.id}`
            }));

            localStorage.setItem('focus_hn_cache', JSON.stringify({
                timestamp: Date.now(),
                stories: simplifiedStories
            }));

            renderStories(simplifiedStories);
        } catch (error) {
            console.error('HN Fetch Error:', error);
            hnList.innerHTML = '<li>Error loading news</li>';
        }
    }

    function renderStories(stories) {
        hnList.innerHTML = '';
        stories.forEach(story => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = story.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = story.title;
            a.title = story.title; // Tooltip for long titles
            li.appendChild(a);
            hnList.appendChild(li);
        });
    }
}
