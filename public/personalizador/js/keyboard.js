/* Editing shortcuts never steal Delete/Backspace or native undo from a text field. */
(()=>{globalThis.MerannoKeyboard={outsideText(target){return !target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],dialog[open]');}};})();
