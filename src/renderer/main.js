require('babel/register');

const React = require('react');
const Main = require('./components/main.jsx');

React.render(React.createElement(Main, null), document.body);
