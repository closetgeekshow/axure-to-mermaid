import { createElement } from '../utils/dom.js'

export class ButtonFactory {
  static createButton(config) {
    const button = createElement('button','');
    button.className = config.className;
    button.dataset.buttonType = config.type;
    button.dataset.action = config.action;
    button.appendChild(this.createIconContainer(config.icons));
    return button;
  }

  static createButtonGroup(groupConfig) {
    const group = document.createElement('div');
    group.className = 'group';
    groupConfig.buttons.forEach(btnConfig => {
      group.appendChild(this.createButton(btnConfig));
    });
    return group;
  }
}