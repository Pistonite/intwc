import { useState } from 'react'

import { SimpleEditor } from "@pistonite/intwc";

const JAVA_VALUE = `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
`;

function App() {

    const [value, setValue] = useState(JAVA_VALUE);

  return (
    <div style={{width: "100vw", height: "100vh", boxSizing: 'border-box', display: "flex"}}>
                <div style={{flex: 1, minWidth: 0, minHeight: 0}}>
                <SimpleEditor
                    value={value}
                    onValueChange={setValue}
                    language="typescript"
                />
                </div>
    </div>
  )
}

export default App
