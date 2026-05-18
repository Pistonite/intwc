# Editor Lifecycle Documentation
This doc covers how the editor is wired up within React, and the lifecycle management.

# Global State
The editors interact with 2 global states during its life time:
1. `editorMap: Map<IStandaloneCodeEditor, EditorState>` in `src/state/editor_registry.ts`.
   Used to acquire the state from an editor instance in a global monaco callback,
   or iterate through all editors in a global monaco callback.
2. `editorPreferenceMap: Map<string, EditorPreference[]>` in `src/state/editor_preference.ts`.
   Used to store a mapping between `persistId` and the editor preference. When preference is
   updated from within one editor that has a `persistId`, all editors with the same `persistId`
   will update to match the preference, and the preference will be persisted to `localStorage`.

# Initialization
`initCodeEditor()` must be called before rendering the React components. Recommendation
is call it during the app's boot flow.

See `src/init.ts`.

# React Components
The entry point to creating an editor is through one of the editor React components:
- `\<SimpleEditor />`, a textarea-like controlled component with a `value` and an `onValueChange`.
- `<FileEditor />`, a single-file editor that exposes the editor state through `onCreated`
- `\<MultiFileEditor />`, a file editor that can store multiple file models.

# Creation
When the React node mounts, the editor will be created and attached to the DOM node that is rendered

1. **Editor State Creation**
  1. A `useEffect` runs to create the `EditorState`, passing in options from the props
  2. The monaco editor instance is created inside `EditorState`
  3. The editor preference is loaded using the `persistId` (if given)
     - If there are persisted preference, those options are immediately applied
       to the editor state and the monaco editor instance.
2. **Monaco Editor Instance Setup**
  1. Register editor state to `editorMap`
     - cleanup: unregister
  2. Register preference instance to `editorPreferenceMap`
     - cleanup: unregister
  3. Per-editor actions added using `addEditorActions()` (`src/state/action.ts`)
  4. Sync editor options to managed preference instance. Does not trigger persistance
  5. Set up per-editor listeners.
     - cleanup: remove listeners
  6. Clean-up functions registered as `EditorState.editorCleanup`

3. **Model Setup**
  1. Monaco model is created and wrapped in `FileModel`. It handles recreation of the model
     and cleanups.
  2. The model is attached to the editor

# Update

1. **Value Change**: When the editor value changes, it's notified through the `ContentChanged`
   event. `SimpleEditor` handles this internally. The other editor components require subscription
   to the event to be notified of value changes.

1. **Editor Recreate**: The editor state supports recreating the underlying monaco editor instance
  without losing state. For example, when the NLS language changes, recreating the editor will
  make some components like hover widget pick up the new languages right away. However most messages
  are loaded as module static and cannot be updated at runtime.
  1. The editor instance is cleaned up (See Creation - #2)
  2. The editor instance is disposed
  3. New editor instance is created on the same DOM node (See Creation - #2)
     - The preference instance is rebinded to the new editor instance then re-registered.
  4. The previous model is attached to the new editor instance

2. **React Prop Change**: React prop change will not recreate the editor, but only update the existing
  instance. Make sure the props are properly memoized either manually or using React Compiler to avoid
  excessive updates.
  1. When an option is changed from React props, it will only change the option for that
     editor instance. If an option is overriden by changing from a UI control, then
     the overriden option still takes precedence.

3. **Option Override**: When an option is changed from a UI control (like the context menu or status bar),
   The editor updates its own options accordingly. If a `persistId` exists for the editor,
   it will notify all other editors with the same ID to also perform the same option update
   (through `editorPreferenceMap`). The preference will also be persisted.
   *You should ensure editors with persistId don't also have options that are changable from props*

  


