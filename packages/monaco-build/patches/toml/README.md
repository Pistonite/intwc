# PR 4786: Implement TOML

https://github.com/microsoft/monaco-editor/pull/4786

## Issue
TOML is not supported 

## Fix
Support TOML

References taken from
- https://microsoft.github.io/monaco-editor/monarch.html
- The YAML tokenizer

## Valiation
Unit tests added according to https://toml.io/en/v1.0.0. Most of the tests are taken directly from the examples in the spec, but some are tweaked to have more coverage.

Also tested in a testing app with vs-dark and light theme
<details>
<summary>vs-dark </summary>

![monaco-toml-dark](https://github.com/user-attachments/assets/4a32fd4c-a560-4c4b-a648-4e9524f3df97)

</details>
<details>
<summary>vs </summary>

![monaco-toml-light](https://github.com/user-attachments/assets/046833f2-3bd8-46c1-9e07-9ec71dbfcd61)

</details>

## Other
Closes #2798 

This is my first monarch language. I didn't do benchmark on performance but it can probably be made faster. However I just made the states in the way it made sense in my head.

The sample file is taken from https://github.com/rust-lang/rust/blob/master/triagebot.toml, which covers a lot of the interesting cases
