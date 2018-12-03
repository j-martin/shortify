// Saves options to localStorage.
const saveOptions = () => {
  localStorage['workspace'] = $('#workspace').val();
  localStorage['urlPatterns'] = $('#urlPatterns').val();
  localStorage['ignoredElements']=$('#ignoredElements').val();
  localStorage['newWindow']=$('#newWindow').is(':checked');
};

// Restores select box state to saved value from localStorage.
const restoreOptions = () => {
  let workspace = $('#workspace');
  let urlPatterns = $('#urlPatterns');
  let ignoredElements = $('#ignoredElements');
  let newWindow = $('#newWindow');

  setRealOnChange(workspace, saveOptions);
  setRealOnChange(urlPatterns, saveOptions);
  setRealOnChange(ignoredElements, saveOptions);
  setRealOnChange(newWindow, saveOptions);

  workspace.val(localStorage['workspace']);
  urlPatterns.val(localStorage['urlPatterns']);
  ignoredElements.val(localStorage['ignoredElements']);

  if (localStorage['newWindow'] === 'true') {
    newWindow.attr('checked', 'checked');
  }
};

const setRealOnChange = (field, onChangeMethod) => (() =>
    field.bind('change keypress paste focus textInput input', () => {
      onChangeMethod();
    }))();

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
});
