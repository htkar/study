import ToyReact, { Component } from "./ToyReact.js";

class MyComponent extends Component {
  render() {
    return (
      <div>
        test
        {this.children}
      </div>
    )
  }
}
let my = (
  <MyComponent name="testMyComponent">
    <div>
      <span>hello</span>
      <span>world</span>
      <span>!</span>
    </div>
  </MyComponent>
)
ToyReact.render(my, document.body);