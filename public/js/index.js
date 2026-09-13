const postList = document.querySelector('#post-list');
const message = document.querySelector('#message');
const writingStatus = document.querySelector('#writing-status');

function showMessage(text, isError = false) {
    message.hidden = false;
    message.textContent = text;
    message.classList.toggle('error', isError);
}

function formatDate(value) {
    return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

function appendPost(post) {
    const item = document.createElement('li');
    item.className = 'post-item';

    const link = document.createElement('a');
    link.href = `/posts/${post.id}`;
    link.textContent = post.title;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${post.authorName} · ${formatDate(post.createdAt)}`;

    item.append(link, meta);
    postList.append(item);
}

async function loadWritingStatus() {
    const response = await fetch('/api/writing-status');
    const status = await response.json();
    writingStatus.textContent = status.isWritingOpen
        ? '지금은 작성, 수정, 삭제가 가능합니다.'
        : '지금은 조회만 가능합니다. 작성 시간은 KST 21:00부터 06:00 직전까지입니다.';
}

async function loadPosts() {
    const response = await fetch('/api/posts');

    if (!response.ok) {
        throw new Error('게시글을 불러오지 못했습니다.');
    }

    const posts = await response.json();
    postList.replaceChildren();

    if (posts.length === 0) {
        showMessage('아직 게시글이 없습니다.');
        return;
    }

    posts.forEach(appendPost);
}

async function main() {
    try {
        await Promise.all([loadWritingStatus(), loadPosts()]);
    } catch (error) {
        showMessage(error.message, true);
    }
}

main();
