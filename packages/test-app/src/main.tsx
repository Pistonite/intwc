import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import "./style.css";

import TestWorker from "./test_worker.ts?worker";
import { initCodeEditor } from '@pistonite/intwc';
import { initDark, initLocale } from '@pistonite/celera';
const worker = new TestWorker();
console.log(worker);

async function main() {
    initDark();
    await initLocale({
        supported: ["en", "zh"],
        default: "en",
        persist: true
    });
    await initCodeEditor({
        preferences: {
            persist: true
        }
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}

void main();

