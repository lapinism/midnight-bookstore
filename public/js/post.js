const postId = window.location.pathname.split('/').filter(Boolean).at(-1);
const title = document.querySelector('#post-title');
const meta = document.querySelector('#post-meta');
const content = document.querySelector('#post-content');
const editLink = document.querySelector('#edit-link');
const deletePostForm = document.querySelector('#delete-post-form');
const deletePostPassword = document.querySelector('#delete-post-password');
const commentList = document.querySelector('#comment-list');
const commentForm = document.querySelector('#comment-form');
const commentContent = document.querySelector('#comment-content');
const commentPassword = document.querySelector('#comment-password');
const message = document.querySelector('#message');
const writingStatus = document.querySelector('#writing-status');

let isWritingOpen = false;

function showMessage(text, isError = false) {
    message.hidden = false;
    message.textContent = text;
    message.classList.toggle('error', isError);
}

function clearMessage() {
    message.hidden = true;
    message.textContent = '';
    message.classList.remove('error');
}

function formatDate(value) {
    return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

function setWriteControlsDisabled(disabled) {
    commentForm.querySelectorAll('input, textarea, button').forEach((element) => {
        element.disabled = disabled;
    });

    deletePostForm.querySelectorAll('input, button').forEach((element) => {
        element.disabled = disabled;
    });

    editLink.classList.toggle('disabled', disabled);
    editLink.setAttribute('aria-disabled', String(disabled));
}

async function loadWritingStatus() {
    const response = await fetch('/api/writing-status');
    const status = await response.json();
    isWritingOpen = status.isWritingOpen;

    writingStatus.textContent = isWritingOpen
        ? '지금은 댓글 작성과 수정, 삭제가 가능합니다.'
        : '지금은 조회만 가능합니다. 작성 시간은 KST 21:00부터 06:00 직전까지입니다.';

    setWriteControlsDisabled(!isWritingOpen);
}

function createCommentItem(comment) {
    const item = document.createElement('li');
    item.className = 'comment-item';

    const body = document.createElement('p');
    body.className = 'comment-content';
    body.textContent = comment.content;

    const itemMeta = document.createElement('p');
    itemMeta.className = 'meta';
    itemMeta.textContent = `${comment.authorName} · ${formatDate(comment.createdAt)}`;

    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = '수정';
    editButton.disabled = !isWritingOpen;
    editButton.addEventListener('click', () => showCommentEditForm(item, comment));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'danger';
    deleteButton.textContent = '삭제';
    deleteButton.disabled = !isWritingOpen;
    deleteButton.addEventListener('click', () => deleteComment(comment.id));

    actions.append(editButton, deleteButton);
    item.append(body, itemMeta, actions);

    return item;
}

function showCommentEditForm(item, comment) {
    clearMessage();

    const form = document.createElement('form');
    form.className = 'stack-form';

    const contentLabel = document.createElement('label');
    contentLabel.textContent = '댓글';
    const textarea = document.createElement('textarea');
    textarea.maxLength = 1000;
    textarea.required = true;
    textarea.value = comment.content;
    contentLabel.append(textarea);

    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = '비밀번호';
    const password = document.createElement('input');
    password.type = 'password';
    password.minLength = 4;
    password.maxLength = 100;
    password.required = true;
    passwordLabel.append(password);

    const actions = document.createElement('div');
    actions.className = 'comment-actions';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = '저장';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'secondary';
    cancel.textContent = '취소';
    cancel.addEventListener('click', () => loadPost());
    actions.append(submit, cancel);

    form.append(contentLabel, passwordLabel, actions);
    item.replaceChildren(form);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const response = await fetch(`/api/comments/${comment.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: textarea.value,
                password: password.value
            })
        });

        if (!response.ok) {
            const error = await response.json();
            showMessage(error.message, true);
            return;
        }

        await loadPost();
    });
}

async function loadPost() {
    const response = await fetch(`/api/posts/${postId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    const post = await response.json();
    title.textContent = post.title;
    meta.textContent = `${post.authorName} · ${formatDate(post.createdAt)}`;
    content.textContent = post.content;
    editLink.href = `/edit/${post.id}`;

    commentList.replaceChildren();

    if (post.comments.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'comment-item muted';
        empty.textContent = '아직 댓글이 없습니다.';
        commentList.append(empty);
        return;
    }

    post.comments.forEach((comment) => {
        commentList.append(createCommentItem(comment));
    });
}

async function createComment(event) {
    event.preventDefault();
    clearMessage();

    const response = await fetch('/api/comments', {
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

    if (!response.ok) {
        const error = await response.json();
        showMessage(error.message, true);
        return;
    }

    commentForm.reset();
    await loadPost();
}

async function deletePost(event) {
    event.preventDefault();
    clearMessage();

    const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: deletePostPassword.value
        })
    });

    if (!response.ok) {
        const error = await response.json();
        showMessage(error.message, true);
        return;
    }

    window.location.href = '/';
}

async function deleteComment(commentId) {
    clearMessage();
    const password = window.prompt('댓글 비밀번호를 입력하세요.');

    if (password === null) {
        return;
    }

    const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });

    if (!response.ok) {
        const error = await response.json();
        showMessage(error.message, true);
        return;
    }

    await loadPost();
}

editLink.addEventListener('click', (event) => {
    if (!isWritingOpen) {
        event.preventDefault();
    }
});

commentForm.addEventListener('submit', createComment);
deletePostForm.addEventListener('submit', deletePost);

Promise.all([loadWritingStatus(), loadPost()]).catch((error) => {
    showMessage(error.message, true);
});
