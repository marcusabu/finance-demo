import React, { useState } from 'react';
import './App.scss';
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Col, Form, FormGroup, Input, Label } from 'reactstrap';
import Finance from './components/finance/Finance';

axios.interceptors.request.use(config => {
    config.url = process.env.REACT_APP_API_URL + config.url;

    const token = localStorage.getItem('token');
    if (token && token !== '') {
        config.headers.Authorization = `Token ${token}`;
    }

    return config;
});

const auth = {
    isAuthenticated: !!localStorage.getItem('token'),
    authenticate(username, password, cb) {
        axios
            .post('auth/token-auth/', {
                username,
                password
            })
            .then(res => {
                localStorage.setItem('token', res.data.token);
                cb();
            })
            .catch(res => {
                // TODO: handle
            })
            .then(res => {
                // TODO: handle
            });
        auth.isAuthenticated = true;
    },
    signout() {
        localStorage.removeItem('token');
        auth.isAuthenticated = false;
    }
};

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();
    const location = useLocation();

    const { from } = location.state || { from: { pathname: '/' } };

    function handleSubmit(event) {
        event.preventDefault();
        auth.authenticate(username, password, () => {
            history.replace(from);
        });
    }

    return (
        <Col md={{ size: 2, offset: 5 }} className="LoginComponent">
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="username">Username</Label>
                    <Input
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Username"
                        onChange={e => setUsername(e.target.value)}
                        value={username}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="password">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                        value={password}
                    />
                </FormGroup>
                <Button>Login</Button>
            </Form>
        </Col>
    );
}

function Logout() {
    auth.signout();
    return <Redirect path="login/" />;
}

// eslint-disable-next-line react/prop-types
function PrivateRoute({ children, ...rest }) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Route {...rest} render={({ location }) => (auth.isAuthenticated ? children : <Redirect to="/login" />)} />;
}

function App() {
    return (
        <Router>
            <Switch>
                <div className="App">
                    <Route path="/login">
                        <Login />
                    </Route>
                    <Route path="/logout">
                        <Logout />
                    </Route>

                    <PrivateRoute path="/">
                        <Finance />
                    </PrivateRoute>
                </div>
            </Switch>
        </Router>
    );
}

export default App;
