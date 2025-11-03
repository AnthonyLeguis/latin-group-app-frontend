export const environment = {
    production: true,
    apiUrl: 'https://latingroupcorp.com/api/v1',
    baseUrl: 'https://latingroupcorp.com',
    frontendUrl: 'https://latingroupcorp.com', // URL del frontend en producción para links de confirmación
    appName: 'LatinGroup App',
    version: '1.0.0',
    recaptchaSiteKey: '6Lf7yvwrAAAAACvAfL4pcBxcf_hvZQVHNOvfV4b5',

    // Pusher Configuration for WebSocket (Production)
    pusher: {
        key: '973188d9e0d862292b8c',
        cluster: 'us2',
        forceTLS: true,
        encrypted: true
    }
};
