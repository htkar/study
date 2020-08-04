export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
     this.range = range;
     this.update();
  }
  update() {
    let placeholder = document.createComment("placeholder");
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);

    this.range.deleteContents();
    let vdom = this.render();
    vdom.mountTo(this.range);
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object") {
          if (typeof oldState[p] !== "object") {
            oldState[p] = {};
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    }
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    // re-render create range
    this.update();
  }

}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    // events
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(RegExp.$1.toLowerCase(), value);
    }
    if (name === "className") {
      name = "class";
    }
    this.root.setAttribute(name, value);
  }
  appendChild(vchild) {
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

const ToyReact = {
  createElement(type, props, ...children) {
    let ele;
    if (typeof type === "string") {
      ele = new ElementWrapper(type);
    } else {
      ele = new type;
    }
    for (let name in props) {
      ele.setAttribute(name, props[name]);
    }
    let insetChildren = (children) => {
      for (let child of children) {
        if (Array.isArray(child)) {
          insetChildren(child)
        } else {
          if (!(child instanceof Component)
            && !(child instanceof ElementWrapper)
            && !(child instanceof TextWrapper)) {
              child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          ele.appendChild(child);
        }
      }
    }
    insetChildren(children);
    return ele;
  },
  render(vdom, root) {
    let range = document.createRange();
    if (root.children.lenght) {
      range.setStartAfter(root.lastChild);
      range.setEndAfter(root.lastChild);
    } else {
      range.setStart(root, 0);
      range.setEnd(root, 0);
    }
    vdom.mountTo(range);
  }
}

export default ToyReact;