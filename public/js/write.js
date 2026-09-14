const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const passwordInput = document.querySelector('#password');
const submitButton = form.querySelector('button[type="submit"]');
const writeLinks = document.querySelectorAll('a[href="/write"]');

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

async function loadWritingStatus() {
    const response = await request('/api/writing-status');
    if (response === null) {
        setWriteLinksDisabled(true);
        submitButton.className = 'disabled';
        submitButton.disabled = true;
        return false;
    }

    const status = await response.json();

    if (status.isWritingOpen) {
        setWriteLinksDisabled(false);
        submitButton.className = 'button';
        submitButton.disabled = false;
        return true;
    }

    setWriteLinksDisabled(true);
    submitButton.className = 'disabled';
    submitButton.disabled = true;
    return false;
}

async function submitPost(event) {
    event.preventDefault();

    const response = await request('/api/posts', {
        method: 'POST',
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

    const post = await response.json();
    window.location.href = `/posts/${post.id}`;
}

async function init() {
    const isWritingOpen = await loadWritingStatus();

    if (isWritingOpen) {
        form.addEventListener('submit', submitPost);
    }
}

init();
