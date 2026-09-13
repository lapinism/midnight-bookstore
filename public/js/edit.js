const postId = window.location.pathname.split('/').filter(Boolean).at(-1);
const form = document.querySelector('#edit-form');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const passwordInput = document.querySelector('#password');
const message = document.querySelector('#message');
const writingStatus = document.querySelector('#writing-status');

function showMessage(text, isError = false) {
    message.hidden = false;
    message.textContent = text;
    message.classList.toggle('error', isError);
}

function setFormDisabled(disabled) {
    form.querySelectorAll('input, textarea, button').forEach((element) => {
        element.disabled = disabled;
    });
}

async function loadWritingStatus() {
    const response = await fetch('/api/writing-status');
    const status = await response.json();

    if (status.isWritingOpen) {
        writingStatus.textContent = '지금은 글을 수정할 수 있습니다.';
        setFormDisabled(false);
        return;
    }

    writingStatus.textContent = '지금은 조회만 가능합니다. 수정 시간은 KST 21:00부터 06:00 직전까지입니다.';
    setFormDisabled(true);
}

async function loadPost() {
    const response = await fetch(`/api/posts/${postId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    const post = await response.json();
    titleInput.value = post.title;
    contentInput.value = post.content;
}

async function submitEdit(event) {
    event.preventDefault();

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
        const error = await response.json();
        showMessage(error.message, true);
        return;
    }

    window.location.href = `/posts/${postId}`;
}

form.addEventListener('submit', submitEdit);

Promise.all([loadWritingStatus(), loadPost()]).catch((error) => {
    showMessage(error.message, true);
});
