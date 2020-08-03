export class Component {
  constructor() {
    this.children = [];
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  mountTo(parent) {
     let vdom = this.render();
     vdom.mountTo(parent);
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }

}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(vchild) {
    vchild.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
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
    vdom.mountTo(root);
  }
}

export default ToyReact;