import React from 'react';
import { Spring } from 'react-spring/renderprops';
import PropTypes from 'prop-types';

function Progress(props) {
    return (
        <h4 className="small font-weight-bold">
            {props.summary.category}{' '}
            <span className="float-right">
                €{props.summary.absolute} of €{props.summary.budget} used
            </span>
            <div className="progress mb-4">
                <Spring
                    from={{ width: '0%' }}
                    to={{ width: `${props.summary.percentage}%` }}
                    onStart={props.onAnimationStarted}
                    onRest={props.onAnimationDone}
                >
                    {springProps => <div className={`progress-bar bg-${props.summary.color}`} style={springProps} />}
                </Spring>
            </div>
        </h4>
    );
}

Progress.propTypes = {
    summary: PropTypes.object.isRequired
};

export default Progress;
