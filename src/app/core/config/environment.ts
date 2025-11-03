export const environment = {
    production: false,
    apiUrl: 'http://127.0.0.1:8000/api/v1',
    baseUrl: 'http://127.0.0.1:8000',
    frontendUrl: 'http://localhost:4200', // URL del frontend para links de confirmación
    appName: 'LatinGroup App',
    version: '1.0.0',
    recaptchaSiteKey: '6Lf7yvwrAAAAACvAfL4pcBxcf_hvZQVHNOvfV4b5',

    // Pusher Configuration for WebSocket (Local Development)
    pusher: {
        key: '973188d9e0d862292b8c',
        cluster: 'us2',
        forceTLS: false,
        encrypted: false
    }
};