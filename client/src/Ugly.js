import React, { Component } from 'react';
import axios from 'axios';

class Ugly extends Component {
  state = {
    seenNum: [],
    n: '',
    values: {}
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchNum();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values : values.data });
  }

  async fetchNum() {
    const seenNum = await axios.get('/api/values/all');
    this.setState({ seenNum: seenNum.data });
  }

  renderNums() {
    return this.state.seenNum.map(({ number }) => number).join(', ');
  }

  renderValues() {
    const entries = [];
    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For given number {key} I calculated {this.state.values[key]}
        </div>
      );
    }
    return entries;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/values',{
      n : this.state.n
    });
    this.setState({ n: '' });
  }

  render(){
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter the num : </label>
          <input value={this.state.n} onChange={(e) => this.setState({n : e.target.value})}/>
          <button>Submit</button>
        </form>
        <h3>Numbers already visited : </h3>
        {this.renderNums()}
        <h3>Calculated values: </h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Ugly;