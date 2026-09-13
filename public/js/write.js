const form = document.querySelector('#write-form');
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
        writingStatus.textContent = '지금은 글을 쓸 수 있습니다.';
        setFormDisabled(false);
        return;
    }

    writingStatus.textContent = '지금은 조회만 가능합니다. 작성 시간은 KST 21:00부터 06:00 직전까지입니다.';
    setFormDisabled(true);
}

async function submitPost(event) {
    event.preventDefault();

    const response = await fetch('/api/posts', {
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

    if (!response.ok) {
        const error = await response.json();
        showMessage(error.message, true);
        return;
    }

    const post = await response.json();
    window.location.href = `/posts/${post.id}`;
}

form.addEventListener('submit', submitPost);
loadWritingStatus().catch((error) => showMessage(error.message, true));
