import React, { Component } from "react";
import axios from "axios";
import Title from "./Title";
import * as mqtt from "react-paho-mqtt";

export default class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Name: "",
      Phone: "",
      amount: this.props.cart1,
      cartArr: this.props.items,
      client: "",
      _topic: ["esp/test"],
      _options: {},
    };
  }

  componentWillMount() {
    const c = mqtt.connect(
      "148.72.247.90",
      Number(9001),
      "mqtt",

      this._onConnectionLost,
      this._onMessageArrived
    ); // mqtt.connect(host, port, clientId, _onConnectionLost, _onMessageArrived)
    this.setState({ client: c });
  }

  handleChange1 = (e) => {
    this.setState({ ...this.state.Name, [e.target.Name]: e.target.value });
  };

  handleChange2 = (e) => {
    this.setState({ ...this.state.Phone, [e.target.Phone]: e.target.value });
  };

  _sendPayload = () => {
    const payload = mqtt.parsePayload("esp/test1", "11204051"); // topic, payload
    this.state.client.send(payload);
  };
  _onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost: " + responseObject.errorMessage);
    }
  };

  // called when messages arrived
  _onMessageArrived = (message) => {
    console.log("onMessageArrived: " + message.payloadString);
  };

  submit = (e, subscription) => {
    e.preventDefault();

    this.state.client.connect({
      onSuccess: () => {
        for (var i = 0; i < this.state._topic.length; i++) {
          this.state.client.subscribe(
            this.state._topic[i],
            this.state._options
          );
          console.log(this.state._topic[i], this.state._options);
        }
      },
    });

    // const sendData = {
    //   Name: this.state.Name,
    //   Phone: this.state.Phone,
    //   Total: this.state.amount,
    //   cartArr: this.state.cartArr,
    // };
    // console.log(sendData);
    // axios
    //   .post("http://localhost/vending_machine/payment.php", sendData)
    //   .then((result) => {
    //     if (result.data.Status === "Invalid") {
    //       alert("Invalid User");
    //     } else {
    //       alert("Data Saved");
    //     }
    //   });
    // alert("PAID");
  };

  render() {
    return (
      <React.Fragment>
        <div className="py-5">
          <div className="container">
            <Title name="Payment" title="Gateway" />
            <div className="row">
              <form onSubmit={this.submit}>
                <input
                  type="text"
                  placeholder="Name"
                  name="Name"
                  onChange={this.handleChange1}
                  required
                />
                <input
                  type="text"
                  placeholder="Phone No."
                  name="Phone"
                  onChange={this.handleChange2}
                  //   required
                />
                <h6>
                  <span className="text-title">Total :</span>
                  <strong>{this.state.amount}</strong>
                  <br />
                  {this.state.cartArr}
                </h6>
                <input type="submit" text="Pay Amount" />
              </form>
              <button onClick={this._sendPayload}>Send Message</button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
