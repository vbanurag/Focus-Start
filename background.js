chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_QUOTE') {
        fetch('https://dummyjson.com/quotes/random')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }

    if (request.type === 'FETCH_WALLPAPER') {
        fetch('https://picsum.photos/1920/1080')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return sendResponse({ success: true, url: response.url });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }
});
