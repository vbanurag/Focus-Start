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

    // Todo Feature
    initTodo();
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

    // Attempt to get name from storage or default
    const name = localStorage.getItem('momentum_name') || 'User';
    document.getElementById('greeting').innerText = `${greeting}, ${name}.`;

    // Allow name editing on double click (simple feature)
    document.getElementById('greeting').addEventListener('dblclick', () => {
        const newName = prompt('What is your name?');
        if (newName) {
            localStorage.setItem('momentum_name', newName);
            document.getElementById('greeting').innerText = `${greeting}, ${newName}.`;
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
    const focus = localStorage.getItem('momentum_focus');
    const completed = localStorage.getItem('momentum_focus_completed') === 'true';

    if (focus) {
        showFocusDisplay(focus, completed);
    }
}

function setFocus(text) {
    if (!text.trim()) return;
    localStorage.setItem('momentum_focus', text);
    localStorage.setItem('momentum_focus_completed', 'false');
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
    localStorage.setItem('momentum_focus_completed', checked);
    const textSpan = document.getElementById('focus-text');
    if (checked) {
        textSpan.classList.add('completed');
    } else {
        textSpan.classList.remove('completed');
    }
}

function deleteFocus() {
    localStorage.removeItem('momentum_focus');
    localStorage.removeItem('momentum_focus_completed');

    document.getElementById('focus-display').classList.add('hidden');
    document.getElementById('focus-input').style.display = 'block';
    document.querySelector('.focus-container h3').innerText = 'What is your main focus for today?';
}

async function loadQuote() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quote_date');
    const savedQuote = localStorage.getItem('quote_text');
    const savedAuthor = localStorage.getItem('quote_author');

    if (savedDate === today && savedQuote) {
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

    // Toggle Panel
    todoToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        todoPanel.classList.toggle('hidden');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!todoPanel.contains(e.target) && !todoToggle.contains(e.target) && !todoPanel.classList.contains('hidden')) {
            todoPanel.classList.add('hidden');
        }
    });

    // Add Todo
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
            addTodo(e.target.value.trim());
            e.target.value = '';
        }
    });
}

function getTodos() {
    const todos = localStorage.getItem('momentum_todos');
    return todos ? JSON.parse(todos) : [];
}

function saveTodos(todos) {
    localStorage.setItem('momentum_todos', JSON.stringify(todos));
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
