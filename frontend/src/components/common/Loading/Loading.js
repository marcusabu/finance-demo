import React, { useState, useEffect } from 'react';
import ReactLoading from 'react-loading';
import './Loading.scss';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

function Loading(props) {
    const [isLoading, setIsLoading] = useState(false);
    const spinnerSpring = useSpring({
        to: {
            opacity: isLoading ? 1 : 0,
            transform: isLoading ? 'scale(1)' : 'scale(0)'
        },
        config: {
            tension: 500,
            friction: 15
        }
    });

    const overlaySpring = useSpring({
        to: {
            opacity: isLoading ? 1 : 0
        },
        config: {
            duration: 800
        }
    });

    useEffect(() => {
        setIsLoading(props.isLoading);
    });

    return (
        <>
            <animated.div style={overlaySpring}>
                <div className="Loading">
                    <animated.div style={spinnerSpring}>
                        <ReactLoading type="spin" color="#000000" />
                    </animated.div>
                </div>
            </animated.div>
        </>
    );
}

Loading.propTypes = {
    isLoading: PropTypes.bool.isRequired
};

export default Loading;
