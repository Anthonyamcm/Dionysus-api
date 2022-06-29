const constantService = {
	MICRO_SERVICES: {
		MICRO_SERVICE_NAME: 'API',
		ERROR: "API MICRO Service error",
		INFO: "API Micro Service info",
		WELCOME: "Welcome to API!",
	},
	LANGUAGES: {
		ENGLISH: 'en',
	},
	DATE: {
		FROM_DEFAULT_DATE: new Date('01-01-1970'),
		TO_DEFAULT_DATE: new Date(),
	},
    ENVIRONMENT: {
		PRODUCTION: 'production',
		STAGING: 'staging',
		DEVELOPMENT: 'development',
	},
	MEDIA: {
		PHOTO: 'photo',
		GALLERY: 'gallery',
		PROFILE: 'profile',
	},
	STATUS: {
		WARNING: 'warning',
		SUCCESS: 'success',
		PENDING: 'pending',
	},
    PLATFORM: {
		IOS: 'ios',
		ANDRIOD: 'android',
		WEB: 'web',
	},
    SESSION: {
		SAVE_SESSION_ERROR: 'cannot save session',
		DELETE_SESSION_ERROR: 'Session is expired',
	},
    REQUEST_TYPE: {
		RECEIPT: 'receipt',
		FUND: 'fund',
		CHANGE_PASSWORD: 'change_password',
		CHANGE_PIN: 'change_pin',
		BLOCK_CARD: 'block_card',
		UNBLOCK_CARD: 'unblock_card',
		TERMINATE_CARD: 'terminate_card',
		VIRTUAL_CARD: 'virtual_card',
		FREE_FORM: 'free_form',
	},
}