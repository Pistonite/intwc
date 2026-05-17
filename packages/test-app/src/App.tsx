import { useState } from 'react'

import { SimpleEditor, StatusItemPreset } from "@pistonite/intwc";
import { DarkToggle, LanguagePicker } from '@pistonite/celera';

const JAVA_VALUE = `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
let foo = "bar";
let fs = require("fs");
`;

function App() {

  const [value, setValue] = useState(JAVA_VALUE);

  return (
    <div style={{width: "100vw", height: "100vh", boxSizing: 'border-box', display: "flex", flexDirection: "column"}}>
            <div style={{display:"flex"}}>
                <DarkToggle />
                <LanguagePicker />

            </div>
                <div style={{flex: 1, minWidth: 0, minHeight: 0}}>
                <SimpleEditor
                    value={value}
                    onValueChange={setValue}
                    language="typescript"
                    statusLeft={[
                        StatusItemPreset.DiagnosticErrors,
                        StatusItemPreset.DiagnosticWarnings,
                    ]}
                    statusRight={[
                        StatusItemPreset.Position,
                        StatusItemPreset.WordWrap,
                    ]}

                />
                </div>
    </div>
  )
}

export default App
