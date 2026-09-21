const page = document.querySelector('main[data-post-id]');
const postId = page.dataset.postId;
const deletePostLink = document.querySelector('#delete-post-link');
const commentList = document.querySelector('#comment-list');
const commentForm = document.querySelector('#comment-form');
const commentContent = document.querySelector('#comment-content');
const commentPassword = document.querySelector('#comment-password');
const commentSubmitButton = commentForm.querySelector('button[type="submit"]');

let activeCommentItem = null;

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
            return;
        }

        window.alert('요청이 거부되었습니다.');
        return;
    }

    if (response.status === 400) {
        const errorResponse = await response.json().catch(() => null);
        window.alert(errorResponse?.message ?? '입력값을 확인해 주세요.');
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

function closeCommentEditForm(item) {
    if (item === null) {
        return;
    }

    const views = item.querySelectorAll('span');
    const form = item.querySelector('.comment-edit-form');

    if (form === null) {
        return;
    }

    form.reset();
    form.hidden = true;
    for (const view of views) {
        view.hidden = false;
    }

    if (activeCommentItem === item) {
        activeCommentItem = null;
    }
}

function openCommentEditForm(item) {
    if (activeCommentItem !== null && activeCommentItem !== item) {
        closeCommentEditForm(activeCommentItem);
    }

    const views = item.querySelectorAll('span');
    const form = item.querySelector('.comment-edit-form');

    if (form === null) {
        return;
    }

    for (const view of views) {
        view.hidden = true;
    }
    form.hidden = false;
    activeCommentItem = item;
    form.querySelector('.comment-content').focus();
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

    if (response !== null) {
        window.location.reload();
    }
}

async function createComment(event) {
    event.preventDefault();

    if (commentSubmitButton.disabled) {
        return;
    }

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

    if (response !== null) {
        window.location.reload();
    }
}

async function updateComment(form, commentId) {
    const contentInput = form.querySelector('.comment-content');
    const passwordInput = form.querySelector('.comment-password');
    const response = await request(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: contentInput.value,
            password: passwordInput.value
        })
    });

    if (response !== null) {
        window.location.reload();
    }
}

async function deletePost(event) {
    event.preventDefault();

    if (deletePostLink.getAttribute('aria-disabled') === 'true') {
        return;
    }

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

    if (response !== null) {
        window.location.href = '/';
    }
}

commentList.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');

    if (action === null || !commentList.contains(action)) {
        return;
    }

    event.preventDefault();

    const item = action.closest('li[data-comment-id]');

    if (action.dataset.action === 'edit') {
        openCommentEditForm(item);
        return;
    }

    if (action.dataset.action === 'cancel') {
        closeCommentEditForm(item);
        return;
    }

    if (action.dataset.action === 'delete') {
        deleteComment(item.dataset.commentId);
    }
});

commentList.addEventListener('submit', (event) => {
    const form = event.target.closest('.comment-edit-form');

    if (form === null) {
        return;
    }

    event.preventDefault();

    const item = form.closest('li[data-comment-id]');
    updateComment(form, item.dataset.commentId);
});

commentForm.addEventListener('submit', createComment);
deletePostLink.addEventListener('click', deletePost);
