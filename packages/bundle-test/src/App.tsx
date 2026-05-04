import { useEffect, useState } from 'react'
import './App.css'

import * as monaco from "@pistonite/intwc/monaco";
import { Uri } from "@pistonite/intwc/monaco";
import { setVsCodeNlsLanguage }from "@pistonite/intwc/monaco/nls";

import AnotherWorker from "./another.ts?worker";

const anotherWorker = new AnotherWorker();
console.log(anotherWorker);

function App() {

    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref) {
            return;
        }
        const instance = monaco.editor.create(ref);
        const model = monaco.editor.createModel(`
class Test {
    public static void main(args: string[]) {
        System.out.println("hello");
    }
}
`, "typescript", Uri.file("Test.ts"));
        instance.setModel(model)
        return () => {
            instance.dispose();
        }
    }, [ref]);

  return (
    <>
      <section id="center">
                <div style={{width:"100%",height:"500px",border:"1px solid red"}} ref={setRef}>
                </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
                    <button onClick={() => {
                        setVsCodeNlsLanguage("zh-cn");
                    }}>
                    </button>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
