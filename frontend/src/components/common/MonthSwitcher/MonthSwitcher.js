import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import moment from 'moment';
import { PropTypes } from 'prop-types';
import './MonthSwitcher.scss';

class MonthSwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            set_date: moment(),
            current_date: moment(),
            disable_next_month: true
        };

        this.incrementMonth = this.incrementMonth.bind(this);
        this.decrementMonth = this.decrementMonth.bind(this);
        this.getPreviousMonth = this.getPreviousMonth.bind(this);
        this.getNextMonth = this.getNextMonth.bind(this);
    }

    getFormattedDate() {
        return this.state.set_date.format('MMMM, YYYY');
    }

    getPreviousMonth() {
        const setDate = this.state.set_date.clone();
        return setDate.subtract(1, 'month').format('MMMM');
    }

    getNextMonth() {
        const setDate = this.state.set_date.clone();
        return setDate.add(1, 'month').format('MMMM');
    }

    decrementMonth() {
        this.state.set_date.subtract(1, 'month');
        this.updateDisabledState();
        this.props.monthChange(this.state.set_date);
    }

    incrementMonth() {
        this.state.set_date.add(1, 'month');
        this.updateDisabledState();
        this.props.monthChange(this.state.set_date);
    }

    updateDisabledState() {
        if (this.state.set_date.isSame(this.state.current_date, 'month')) {
            this.setState({
                disable_next_month: true
            });
        } else {
            this.setState({
                disable_next_month: false
            });
        }
    }

    render() {
        return (
            <ButtonGroup className="MonthSwitcher">
                <Button color="link" onClick={this.decrementMonth}>
                    <i className="fas fa-chevron-left" /> {this.getPreviousMonth()}
                </Button>{' '}
                <Button
                    outline
                    disabled
                    color="link
                "
                >
                    {this.getFormattedDate()}
                </Button>{' '}
                <Button color="link" disabled={this.state.disable_next_month} onClick={this.incrementMonth}>
                    {this.getNextMonth()} <i className="fas fa-chevron-right" />
                </Button>{' '}
            </ButtonGroup>
        );
    }
}

MonthSwitcher.propTypes = {
    monthChange: PropTypes.func.isRequired
};

export default MonthSwitcher;
