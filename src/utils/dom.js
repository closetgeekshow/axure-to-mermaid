export function createElement(elementType, textContent = '', props = {}) {
  const element = document.createElement(elementType);
  element.textContent = textContent;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        element.style[styleKey] = styleValue;
      });
    } else {
      element[key] = value;
    }
  }
  return element;
}

export function copyToClipboard(copyText) {
  const textarea = document.createElement("textarea");
  textarea.value = copyText;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}


