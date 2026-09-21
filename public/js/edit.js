const form = document.querySelector('#edit-form');
const postId = form.dataset.postId;
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const passwordInput = document.querySelector('#password');
const submitButton = form.querySelector('button[type="submit"]');

function disableEditForm() {
    submitButton.className = 'disabled';
    submitButton.disabled = true;
}

async function alertRequestError(response) {
    if (response.status === 403) {
        const errorResponse = await response.json().catch(() => null);

        if (errorResponse?.error === 'PASSWORD_MISMATCH') {
            window.alert('비밀번호가 옳지 않습니다.');
            return;
        }

        if (errorResponse?.error === 'WRITING_CLOSED') {
            window.alert('게시글과 댓글 작성, 수정, 삭제는 KST 기준 21:00부터 익일 06:00 직전까지만 가능합니다.');
            disableEditForm();
            return;
        }

        if (errorResponse?.error === 'EDIT_WINDOW_EXPIRED') {
            window.alert('게시글과 댓글 수정은 작성 후 10분 이내에만 가능합니다.');
            disableEditForm();
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

async function submitEdit(event) {
    event.preventDefault();

    if (submitButton.disabled) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`, {
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

        if (!response.ok) {
            await alertRequestError(response);
            return;
        }

        window.location.href = `/posts/${postId}`;
    } catch (error) {
        window.alert('서버 오류가 발생했습니다.');
    }
}

form.addEventListener('submit', submitEdit);
