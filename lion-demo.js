import { html, LitElement } from 'lit';

// As a side-effect this way of importing defines the custom elements, eg. <lion-button>, ready for use
import '@lion/ui/define/lion-button.js';
import '@lion/ui/define/lion-form.js';
import '@lion/ui/define/lion-input.js';

export class LionDemo extends LitElement {
  static properties = {
    header: { type: String },
    counter: { type: Number },
  };
  constructor() {
    super();
    this.header = 'Hey dev';
    this.counter = 0;
  }

  render() {
    return html`
      <h1>Test WebMCP with lion elements</h1>
      </form>
      <lion-form @submit="${ev => ev.preventDefault()}">
        <form @submit="${(event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            alert(JSON.stringify(data, null, 2));
          }}"
          id="incrementerForm"
          toolautosubmit
          toolname="fill_in_customer_name"
          tooldescription="Fill in Customer first and last name"
        >
          <lion-input
            name="firstName"
            label="First Name"
            toolparamdescription="Customer's first name"
          ></lion-input>
          <lion-input
            name="lastName"
            label="Last Name"
            toolparamdescription="Customer's last name"
          ></lion-input>
          <button>Submit</button>
        </form>
      </lion-form>
    `;
  }
}
customElements.define('lion-demo', LionDemo);