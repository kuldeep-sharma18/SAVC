/**
 * @typedef {Object} CommentItem
 * @property {string} id
 * @property {string} author
 * @property {string} avatar
 * @property {string} text
 * @property {string} timestamp
 * @property {number} likes
 */

/**
 * @typedef {Object} VideoItem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {{ name: string, handle: string, avatar: string, verified?: boolean }} author
 * @property {string} videoUrl
 * @property {number} duration
 * @property {number} likesCount
 * @property {number} sharesCount
 * @property {number} commentsCount
 * @property {CommentItem[]} comments
 * @property {boolean} [userLiked]
 * @property {string[]} tags
 */

export {};
