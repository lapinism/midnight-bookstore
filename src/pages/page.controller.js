import { getPostDetail, getPosts } from '../posts/post.service.js';
import { getWritingStatus, isEditWindowOpen } from '../policy/time.service.js';
import { positiveInteger } from '../utils/validation.js';

function formatKstDate(value) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    });
    const parts = Object.fromEntries(
        formatter.formatToParts(new Date(value)).map(({ type, value: partValue }) => {
            return [type, partValue];
        })
    );

    return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

function postViewModel(post, now, isWritingOpen) {
    return {
        ...post,
        displayCreatedAt: formatKstDate(post.createdAt),
        canEdit: isWritingOpen && isEditWindowOpen(post.createdAt, now),
        comments: post.comments?.map((comment) => {
            return {
                ...comment,
                displayCreatedAt: formatKstDate(comment.createdAt),
                canEdit: isWritingOpen && isEditWindowOpen(comment.createdAt, now)
            };
        }) ?? []
    };
}

export function indexPage(req, res) {
    const { isWritingOpen } = getWritingStatus();
    const posts = getPosts().map((post) => {
        return {
            ...post,
            displayCreatedAt: formatKstDate(post.createdAt)
        };
    });

    res.render('index', { posts, isWritingOpen });
}

export function postPage(req, res) {
    const id = positiveInteger(req.params.id, 'post id');
    const now = new Date();
    const { isWritingOpen } = getWritingStatus(now);
    const post = postViewModel(getPostDetail(id), now, isWritingOpen);

    res.render('post', { post, isWritingOpen });
}

export function writePage(req, res) {
    const { isWritingOpen } = getWritingStatus();

    res.render('write', { isWritingOpen });
}

export function editPage(req, res) {
    const id = positiveInteger(req.params.id, 'post id');
    const now = new Date();
    const { isWritingOpen } = getWritingStatus(now);
    const post = postViewModel(getPostDetail(id), now, isWritingOpen);

    res.render('edit', { post, isWritingOpen });
}
