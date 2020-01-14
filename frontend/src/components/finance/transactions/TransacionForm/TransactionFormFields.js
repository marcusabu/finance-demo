import React from 'react';
import { Input, FormGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import { CategoryContext } from '../../Finance';

class TransactionFormFields extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: this.props.keyword,
            idx: this.props.idx
        };
    }

    componentDidMount() {
        this.setState({ ...this.props });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({ ...nextProps });
        }
    }

    render() {
        return (
            <>
                <FormGroup>
                    <Input
                        type="text"
                        name="keyword"
                        data-id={this.state.idx}
                        className="categoryKeyword"
                        value={this.state.keyword}
                        onChange={this.props.onChange}
                    />
                    <Input
                        type="select"
                        name="category"
                        data-id={this.state.idx}
                        id="categorySelect"
                        onChange={this.props.onChange}
                    >
                        <option>---</option>
                        <CategoryContext.Consumer>
                            {categories => {
                                return categories.map((category, idx) => {
                                    return (
                                        <option key={idx} value={category.pk}>
                                            {category.title}
                                        </option>
                                    );
                                });
                            }}
                        </CategoryContext.Consumer>
                    </Input>
                </FormGroup>
            </>
        );
    }
}

TransactionFormFields.propTypes = {
    onChange: PropTypes.func.isRequired,
    idx: PropTypes.number.isRequired,
    keyword: PropTypes.string.isRequired
};

export default TransactionFormFields;
