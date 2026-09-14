const postList = document.querySelector('ul');
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
        link.classList.toggle('disabled', disabled);
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
        return;
    }

    const status = await response.json();
    setWriteLinksDisabled(!status.isWritingOpen);
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

function appendPost(post) {
    const item = document.createElement('li');
    item.className = 'post-item';

    const link = document.createElement('a');
    link.href = `/posts/${post.id}`;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'strong';
    titleSpan.textContent = post.title;

    const informationSpan = document.createElement('span');
    informationSpan.className = 'quiet';
    informationSpan.textContent = `${post.authorName} | ${formatDate(post.createdAt)}`;

    link.append(titleSpan, informationSpan);
    item.append(link);

    postList.append(item);
}

document.addEventListener('DOMContentLoaded', async (e) => {
    await loadWritingStatus();

    const response = await request('/api/posts');
    if (response === null) {
        return;
    }

    const posts = await response.json();
    postList.replaceChildren();

    if (posts.length !== 0) {
        posts.forEach(appendPost);
    }
});
