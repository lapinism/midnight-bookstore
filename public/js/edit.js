const postId = window.location.pathname.split('/').filter(Boolean).at(-1);
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const passwordInput = document.querySelector('#password');
const submitButton = form.querySelector('button[type="submit"]');
const writeLinks = document.querySelectorAll('a[href="/write"]');

const EDIT_WINDOW_MS = 10 * 60 * 1000;

let currentPost = null;
let isWritingOpen = false;

async function alertRequestError(response) {
    if (response.status === 403) {
        const errorResponse = await response.json().catch(() => null);

        if (errorResponse?.error === 'PASSWORD_MISMATCH') {
            window.alert('비밀번호가 옳지 않습니다.');
            return;
        }

        if (errorResponse?.error === 'WRITING_CLOSED') {
            window.alert('게시글과 댓글 작성, 수정, 삭제는 KST 기준 21:00부터 익일 06:00 직전까지만 가능합니다.');
            return;
        }

        if (errorResponse?.error === 'EDIT_WINDOW_EXPIRED') {
            window.alert('게시글과 댓글 수정은 작성 후 10분 이내에만 가능합니다.');
            setEditFormDisabled(true);
            return;
        }

        window.alert('요청이 거부되었습니다.');
        return;
    }

    window.alert('서버 오류가 발생했습니다.');
}

async function request(url, options) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            await alertRequestError(response);
            return null;
        }

        return response;
    } catch (error) {
        window.alert('서버 오류가 발생했습니다.');
        return null;
    }
}

function setWriteLinksDisabled(disabled) {
    writeLinks.forEach((link) => {
        link.className = disabled ? 'disabled' : 'button';
        link.setAttribute('aria-disabled', String(disabled));

        if (disabled) {
            link.removeAttribute('href');
            return;
        }

        link.href = '/write';
    });
}

function isEditWindowOpen(createdAt) {
    const createdTime = Date.parse(createdAt);

    if (Number.isNaN(createdTime)) {
        return false;
    }

    const elapsed = Date.now() - createdTime;
    return elapsed >= 0 && elapsed < EDIT_WINDOW_MS;
}

function setEditFormDisabled(disabled) {
    submitButton.className = disabled ? 'disabled' : 'button';
    submitButton.disabled = disabled;
}

function updateEditFormState() {
    const canEdit = isWritingOpen && currentPost !== null && isEditWindowOpen(currentPost.createdAt);
    setEditFormDisabled(!canEdit);
}

async function loadPost() {
    const response = await request(`/api/posts/${postId}`);
    if (response === null) {
        return;
    }

    const post = await response.json();
    currentPost = post;
    titleInput.value = post.title;
    contentInput.value = post.content;
    updateEditFormState();
}

async function loadWritingStatus() {
    const response = await request('/api/writing-status');
    if (response === null) {
        setWriteLinksDisabled(true);
        isWritingOpen = false;
        updateEditFormState();
        return false;
    }

    const status = await response.json();
    isWritingOpen = status.isWritingOpen;

    if (isWritingOpen) {
        setWriteLinksDisabled(false);
        updateEditFormState();
        return true;
    }

    setWriteLinksDisabled(true);
    updateEditFormState();
    return false;
}

async function submitEdit(event) {
    event.preventDefault();

    if (!isWritingOpen || currentPost === null || !isEditWindowOpen(currentPost.createdAt)) {
        updateEditFormState();
        return;
    }

    const response = await request(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: titleInput.value,
            content: contentInput.value,
            password: passwordInput.value
        })
    });
    if (response === null) {
        return;
    }

    window.location.href = `/posts/${postId}`;
}

async function init() {
    await loadPost();
    await loadWritingStatus();
    form.addEventListener('submit', submitEdit);
}

init();
