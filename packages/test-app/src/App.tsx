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

  const [value1, setValue1] = useState(JAVA_VALUE);
  const [value2, setValue2] = useState(JAVA_VALUE);
  const [value3, setValue3] = useState(JAVA_VALUE);

  return (
    <div style={{width: "100vw", height: "100vh", boxSizing: 'border-box', display: "flex", flexDirection: "column"}}>
            <div style={{display:"flex"}}>
                <DarkToggle />
                <LanguagePicker />

            </div>
                <SimpleEditor
                    value={value1}
                    onValueChange={setValue1}
                    language="typescript"
                persistId="1"
                    statusLeft={[
                    "persist 1",
                        StatusItemPreset.DiagnosticErrors,
                        StatusItemPreset.DiagnosticWarnings,
                    ]}
                    statusRight={[
                        StatusItemPreset.Position,
                        StatusItemPreset.WordWrap,
                    ]}

                />
                <SimpleEditor
                    value={value2}
                    onValueChange={setValue2}
                    language="java"
                    filename="HelloWorld.java"
                persistId="1"
                    statusLeft={[
                        "persist 1",
                        StatusItemPreset.File,
                    ]}
                    statusRight={[
                        StatusItemPreset.Language,
                    ]}
                />
                <SimpleEditor
                    value={value3}
                    onValueChange={setValue3}
                    language="java"
                    filename="HelloWorld.java"
                persistId="2"
                    statusLeft={[
                        "persist 2",
                        StatusItemPreset.File,
                    ]}
                    statusRight={[
                        StatusItemPreset.LanguageId,
                    ]}
                />
    </div>
  )
}

export default App
