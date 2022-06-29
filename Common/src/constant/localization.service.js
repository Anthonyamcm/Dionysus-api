const LocalizedStrings = require('localized-strings').default;

const strings = new LocalizedStrings(
    {
        VALIDATION_ERROR: {
            INVALID_PASSWORD: {
                text: 'Invalid password',
                code: '101',
            },
            INVALID_EMAIL: {
                text: 'Invalid email',
                code: '102',
            },
            INVALID_FIRST_NAME: {
                text: 'Invalid first name',
                code: '103',
            },
            INVALID_LAST_NAME: {
                text: 'Invalid last name',
                code: '104',
            },
            INVALID_TOKEN: {
                text: 'Invalid Token',
                code: '105',
            },
            SESSION_NOT_FOUND: {
                text: 'Session not found',
                code: '116',
            },
            USER_NOT_FOUND: {
                text: 'User not found',
                code: '124',
            },
            PHOTO_NOT_FOUND: {
                text: 'Photo not found',
                code: '125',
            },
            SESSION_EXPIRED: {
                text: 'Session expired',
                code: '172',
            },
            NOT_AUTHORIZE: {
                text: 'Your request not authorize!',
                code: '178',
            },
            EMAIL_IS_TAKEN: {
                text: 'This email is already taken',
                code: '179',
            },

        }

    }
)

module.exports = strings;