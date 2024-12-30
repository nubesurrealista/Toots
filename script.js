const instanceURL = 'https://tkz.one';
const userHandle = 'nubesurrealista';
const linkPreviewApiKey = 'b0a8335fdc903c0b312b64d3c72b62c2';

function sanitizeHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.textContent || '';
}

function convertLinksToClickable(content) {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return content.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

async function fetchLinkPreview(url) {
    try {
        const response = await fetch(`https://api.linkpreview.net/?key=${linkPreviewApiKey}&q=${encodeURIComponent(url)}`);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error fetching link preview');
        }
    } catch (error) {
        console.error('Error fetching link preview:', error);
        return null;
    }
}

async function generateLinkPreviews(contentDiv) {
    const links = contentDiv.querySelectorAll('a');
    for (const link of links) {
        const url = link.href;
        if (url.includes(instanceURL)) {
            continue; // Skip links from the same Mastodon instance
        }
        const previewData = await fetchLinkPreview(url);
        if (previewData) {
            const previewHtml = `
                <div class="link-preview">
                    <img src="${previewData.image}" alt="${previewData.title}">
                    <p><strong>${previewData.title}</strong></p>
                    <p>${previewData.description}</p>
                </div>
            `;
            link.insertAdjacentHTML('afterend', previewHtml);
        }
    }
}

async function loadToots() {
    const errorDiv = document.getElementById("error-message");
    const contentDiv = document.getElementById("rss-content");
    contentDiv.innerHTML = 'Cargando...';
    errorDiv.innerText = '';

    try {
        const accountResponse = await fetch(`${instanceURL}/api/v1/accounts/lookup?acct=${userHandle}`);
        if (!accountResponse.ok) {
            throw new Error(`Error al buscar la cuenta: ${accountResponse.status} ${accountResponse.statusText}`);
        }
        const account = await accountResponse.json();
        if (!account) {
            throw new Error(`No se encontró la cuenta ${userHandle}`);
        }

        const userId = account.id;
        const tootsResponse = await fetch(`${instanceURL}/api/v1/accounts/${userId}/statuses?limit=20&exclude_replies=false&exclude_reblogs=false`);
        if (!tootsResponse.ok) {
            throw new Error(`Error al cargar los toots: ${tootsResponse.status} ${tootsResponse.statusText}`);
        }
        const toots = await tootsResponse.json();

        contentDiv.innerHTML = '';
        if (toots.length > 0) {
            toots.forEach(toot => {
                const isReblog = toot.reblog !== null;
                const tootContent = isReblog ? toot.reblog : toot;
                
                let content = sanitizeHTML(tootContent.content);
                content = convertLinksToClickable(content);
                const createdAt = new Date(tootContent.created_at).toLocaleString();
                const url = tootContent.url;
                const mediaAttachments = tootContent.media_attachments;
                const avatar = tootContent.account.avatar;
                const emojis = tootContent.emojis;
                let mediaHtml = '';

                if (mediaAttachments.length > 0) {
                    mediaHtml = '<div class="media-gallery">';
                    mediaAttachments.forEach(media => {
                        if (media.type === 'image') {
                            mediaHtml += `<img src="${media.url}" alt="${media.description || 'Imagen adjunta'}">`;
                        }
                    });
                    mediaHtml += '</div>';
                }

                if (emojis.length > 0) {
                    emojis.forEach(emoji => {
                        content = content.replace(`:${emoji.shortcode}:`, `<img src="${emoji.url}" alt="${emoji.shortcode}" class="emoji">`);
                    });
                }

                const reblogNotice = isReblog ? '<p>Impulsado por el usuario</p>' : '';

                const htmlContent = `
                    <div class="toot">
                        ${reblogNotice}
                        <div class="toot-header">
                            <img src="${avatar}" alt="Avatar" class="avatar">
                            <div class="toot-info">
                                <h3>${tootContent.account.display_name}</h3>
                                <p>@${tootContent.account.acct}</p>
                            </div>
                        </div>
                        <p>${content}</p>
                        ${mediaHtml}
                        <p>Likes: ${tootContent.favourites_count} | Impulsos: ${tootContent.reblogs_count}</p>
                        <p><a href="${url}" target="_blank" rel="noopener noreferrer">Publicado el ${createdAt}</a></p>
                        <button onclick="viewPost('${tootContent.id}')">Ver más</button>
                    </div>
                    <hr/>
                `;
                contentDiv.innerHTML += htmlContent;
            });

            // Generate link previews after toots are loaded
            await generateLinkPreviews(contentDiv);
        } else {
            errorDiv.innerText = 'No se encontraron toots.';
        }
    } catch (error) {
        console.error("Error:", error);
        contentDiv.innerHTML = '';
        errorDiv.innerText = `Error: ${error.message}`;
    }
}

async function viewPost(postId) {
    const modal = document.getElementById("postModal");
    const modalContent = document.getElementById("modal-content");
    const errorDiv = document.getElementById("error-message");

    try {
        const postResponse = await fetch(`${instanceURL}/api/v1/statuses/${postId}`);
        if (!postResponse.ok) {
            throw new Error(`Error al cargar el toot: ${postResponse.status} ${postResponse.statusText}`);
        }
        const post = await postResponse.json();
        let content = sanitizeHTML(post.content);
        content = convertLinksToClickable(content);
        const createdAt = new Date(post.created_at).toLocaleString();
        const url = post.url;
        const mediaAttachments = post.media_attachments;
        const avatar = post.account.avatar;
        const emojis = post.emojis;
        let mediaHtml = '';

        if (mediaAttachments.length > 0) {
            mediaHtml = '<div class="media-gallery">';
            mediaAttachments.forEach(media => {
                if (media.type === 'image') {
                    mediaHtml += `<img src="${media.url}" alt="${media.description || 'Imagen adjunta'}">`;
                }
            });
            mediaHtml += '</div>';
        }

        if (emojis.length > 0) {
            emojis.forEach(emoji => {
                content = content.replace(`:${emoji.shortcode}:`, `<img src="${emoji.url}" alt="${emoji.shortcode}" class="emoji">`);
            });
        }

        const htmlContent = `
            <div class="toot">
                <div class="toot-header">
                    <img src="${avatar}" alt="Avatar" class="avatar">
                    <div class="toot-info">
                        <h3>${post.account.display_name}</h3>
                        <p>@${post.account.acct}</p>
                    </div>
                </div>
                <p>${content}</p>
                ${mediaHtml}
                <p>Likes: ${post.favourites_count} | Impulsos: ${post.reblogs_count}</p>
                <p><a href="${url}" target="_blank" rel="noopener noreferrer">Publicado el ${createdAt}</a></p>
            </div>
        `;
        modalContent.innerHTML = htmlContent;
        modal.style.display = "block";

        // Generate link previews for the modal content
        await generateLinkPreviews(modalContent);
    } catch (error) {
        console.error("Error:", error);
        errorDiv.innerText = `Error: ${error.message}`;
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'blue' : 'light';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('theme-toggle').innerText = `Tema: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`;
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

window.onload = loadToots;

// Modal close functionality
const modal = document.getElementById("postModal");
const span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}