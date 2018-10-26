import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      submission: {
        name: "Ben",
        email: "benjamin.coleman@thebodyshop.com",
        subject: "hello"
      },
      message: "",
      isError: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({ submission: { ...this.state.submission, [name]: value } });
  }


  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.submission.email.endsWith("thebodyshop.com")) {
      this.setState({message: "Must use a bodyshop email address", isError: true});
      return
    }
   
    axios.post(process.env.REACT_APP_API_URL + 'api/v1/submission', this.state.submission)
      .then(resp => {
        this.setState({
          message: resp.data, 
          isError: false, 
          submission: {...this.state.submission, subject: ""} // Set the subject to empty so users can add another quickly
        });
      }).catch((error) => {
        this.setState({message: error.response.data, isError: true});
      });
  }


  render() {
    return (
      <div className="App">
        <h2>Submit 5m Talk</h2>
        {this.state.message ? 
          <div className={"alert " + (this.state.isError ? "alert-danger": "alert-success")}>{this.state.message}</div> : ""}
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input name="name" className="form-control" id="name" type="text" value={this.state.submission.name} onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input name="email" className="form-control" type="email" value={this.state.submission.email} onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Brief Summary:</label>
            <textarea name="subject" className="form-control" type="text" value={this.state.submission.subject} onChange={this.handleChange} />
          </div>
          <input className="btn btn-primary" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default App;
