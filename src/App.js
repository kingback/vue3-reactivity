import React, { useState, useEffect } from 'react';
// import { stop, effect, reactive } from '@vue/reactivity';
import { stop, effect, reactive } from './reactive/index';
import logo from './logo.svg';
import './App.css';

function useReactive(state, fn) {
  const [component, setComponent] = useState(null);
  const [store] = useState(() => reactive(state));

  useEffect(() => {
    const runner = effect(() => setComponent(fn(store)));
    return () => stop(runner);
  }, []);

  return component;
}

function App() {
  return useReactive({
    title: 'React App',
    list: [0],
    data: {
      count: 0
    }
  }, (store) => {
    const title = {
      value: store.title + ' ' + store.data.count
    };

    return (
      <div className="App">
        <header className="App-header">
          <h1>{title.value}</h1>
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <div className="counter">
            <span className="counter-txt">Counter:</span>
            <button className="counter-btn" onClick={() => store.data.count--}>-</button>
            <span className="counter-num">{store.data.count}</span>
            <button className="counter-btn" onClick={() => { store.data.count++; }}>+</button>
          </div>
          <div className="counter">
            <span className="counter-txt">Array Counter:</span>
            <button className="counter-btn" onClick={() => store.list.pop()}>-</button>
            <span className="counter-num">{store.list.length}</span>
            <button className="counter-btn" onClick={() => store.list.push(store.list.length)}>+</button>
          </div>
        </header>
      </div>
    );
  });
}

export default App;
