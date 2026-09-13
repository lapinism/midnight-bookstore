const postId = window.location.pathname.split('/').filter(Boolean).at(-1);
const title = document.querySelector('#post-title');
const meta = document.querySelector('#post-meta');
const content = document.querySelector('#post-content');
const editLink = document.querySelector('#edit-link');
const deletePostLink = document.querySelector('#delete-post-link');
const commentList = document.querySelector('ul');
const commentForm = document.querySelector('#comment-form');
const commentContent = document.querySelector('#comment-content');
const commentPassword = document.querySelector('#comment-password');
const commentSubmitButton = commentForm.querySelector('button[type="submit"]');
const writeLinks = document.querySelectorAll('a[href="/write"]');

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

function formatDate(value) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    const parts = Object.fromEntries(
        formatter.formatToParts(new Date(value))
        .map(({ type, value }) => [type, value])
    );

    return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

async function loadWritingStatus() {
    const response = await request('/api/writing-status');
    if (response === null) {
        setActionControlsDisabled(true);
        return false;
    }

    const status = await response.json();
    isWritingOpen = status.isWritingOpen;
    setActionControlsDisabled(!isWritingOpen);

    return isWritingOpen;
}

function setActionControlsDisabled(disabled) {
    writeLinks.forEach((link) => {
        link.classList.toggle('disabled', disabled);
        link.setAttribute('aria-disabled', String(disabled));

        if (disabled) {
            link.removeAttribute('href');
            return;
        }

        link.href = '/write';
    });

    commentSubmitButton.classList.toggle('disabled', disabled);
    commentSubmitButton.disabled = disabled;

    deletePostLink.classList.toggle('disabled', disabled);
    deletePostLink.setAttribute('aria-disabled', String(disabled));

    if (disabled) {
        editLink.classList.add('disabled');
        editLink.setAttribute('aria-disabled', 'true');
        editLink.removeAttribute('href');
        return;
    }

    editLink.classList.remove('disabled');
    editLink.setAttribute('aria-disabled', 'false');
}

function createCommentItem(comment) {
    const item = document.createElement('li');

    const contentSpan = document.createElement('span');
    contentSpan.textContent = comment.content;
    item.append(contentSpan);

    const informationSpan = document.createElement('span');
    informationSpan.className = 'quiet';
    informationSpan.textContent = `${comment.authorName} | ${formatDate(comment.createdAt)}`;
    item.append(informationSpan);

    const actions = document.createElement('div');
    actions.className = 'comment-actions';
    actions.style.textAlign = 'right';

    const editButton = document.createElement('a');
    editButton.className = 'button';
    editButton.textContent = '수정';

    const deleteButton = document.createElement('a');
    deleteButton.className = 'danger';
    deleteButton.textContent = '삭제';

    if (isWritingOpen) {
        editButton.addEventListener('click', () => showCommentEditForm(item, comment));
        deleteButton.addEventListener('click', () => deleteComment(comment.id));
    } else {
        editButton.classList.add('disabled');
        editButton.setAttribute('aria-disabled', 'true');
        deleteButton.classList.add('disabled');
        deleteButton.setAttribute('aria-disabled', 'true');
    }

    actions.append(editButton, deleteButton);
    item.append(actions);

    return item;
}

function showCommentEditForm(item, comment) {
    const form = document.createElement('form');
    form.className = 'comment-form';

    const contentInput = document.createElement('input');
    contentInput.className = 'comment-content';
    contentInput.type = 'text';
    contentInput.maxLength = 1000;
    contentInput.placeholder = '댓글';
    contentInput.required = true;
    contentInput.value = comment.content;

    const password = document.createElement('input');
    password.className = 'comment-password';
    password.type = 'password';
    password.minLength = 4;
    password.maxLength = 100;
    password.placeholder = '비밀번호';
    password.required = true;

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'button';
    submit.textContent = '저장';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'danger';
    cancel.textContent = '취소';
    cancel.addEventListener('click', () => loadPost());

    form.append(contentInput, password, submit, cancel);
    item.replaceChildren(form);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const response = await request(`/api/comments/${comment.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: contentInput.value,
                password: password.value
            })
        });
        if (response === null) {
            return;
        }

        await loadPost();
    });
}

async function loadPost() {
    const response = await request(`/api/posts/${postId}`);
    if (response === null) {
        return;
    }

    const post = await response.json();
    title.textContent = post.title;
    meta.textContent = `${post.authorName} · ${formatDate(post.createdAt)}`;
    content.textContent = post.content;
    if (isWritingOpen) {
        editLink.href = `/edit/${post.id}`;
    } else {
        editLink.removeAttribute('href');
    }

    commentList.replaceChildren();

    if (post.comments.length === 0) {
        return;
    }

    post.comments.forEach((comment) => {
        commentList.append(createCommentItem(comment));
    });
}

async function createComment(event) {
    event.preventDefault();

    const response = await request('/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId,
            content: commentContent.value,
            password: commentPassword.value
        })
    });
    if (response === null) {
        return;
    }

    commentForm.reset();
    await loadPost();
}

async function deletePost(event) {
    event.preventDefault();

    const password = window.prompt('게시글 비밀번호를 입력하세요.');

    if (password === null) {
        return;
    }

    const response = await request(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });
    if (response === null) {
        return;
    }

    window.location.href = '/';
}

async function deleteComment(commentId) {
    const password = window.prompt('댓글 비밀번호를 입력하세요.');

    if (password === null) {
        return;
    }

    const response = await request(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });
    if (response === null) {
        return;
    }

    await loadPost();
}

async function init() {
    const canWrite = await loadWritingStatus();

    if (canWrite) {
        commentForm.addEventListener('submit', createComment);
        deletePostLink.addEventListener('click', deletePost);
    }

    await loadPost();
}

init();
