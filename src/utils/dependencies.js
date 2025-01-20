import { CONFIG } from '../config/constants.js';

export async function loadDependencies() {
    for (const dep of CONFIG.dependencies) {
        await loadScript(dep);
    }
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
