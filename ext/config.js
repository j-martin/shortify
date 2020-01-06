// Saves options to localStorage.
const saveOptions = () => {
  localStorage["workspace"] = document.querySelector("#workspace").value;
  localStorage["urlPatterns"] = document.querySelector("#urlPatterns").value;
  localStorage["ignoredElements"] = document.querySelector(
    "#ignoredElements"
  ).value;
  localStorage["newWindow"] = document.querySelector("#newWindow").checked;
};

// Restores select box state to saved value from localStorage.
const restoreOptions = () => {
  let workspace = document.querySelector("#workspace");
  let urlPatterns = document.querySelector("#urlPatterns");
  let ignoredElements = document.querySelector("#ignoredElements");
  let newWindow = document.querySelector("#newWindow");

  workspace.onchange = saveOptions;
  urlPatterns.onchange = saveOptions;
  ignoredElements.onchange = saveOptions;
  newWindow.onchange = saveOptions;

  workspace.value = localStorage["workspace"] || null;
  urlPatterns.value = localStorage["urlPatterns"] || null;
  ignoredElements.value = localStorage["ignoredElements"] || null;
  newWindow.checked = localStorage["newWindow"] || false;
};

document.addEventListener("DOMContentLoaded", restoreOptions);
