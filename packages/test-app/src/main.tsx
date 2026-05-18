import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";

import TestWorker from "./test_worker.ts?worker";
import { initCodeEditor } from '@pistonite/intwc';
import { initDark, initLocale, ThemeProvider } from '@pistonite/celera';
const worker = new TestWorker();
console.log(worker);

async function main() {
    initDark();
    await initLocale({
        supported: ["en-US", "zh-CN", "ja-JP"],
        default: "en-US",
        persist: true,
        loader: async () => {
            return {
                "test_default_ns_message": "hello, world!"
            }
        }
    });
    await initCodeEditor({
        preferences: {
            persist: true
        },
        language: {
            typescript: {
                lib: ["dom"]
            }
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <ThemeProvider>
            <App />
            </ThemeProvider>
        </StrictMode>,
    )
}

void main();

