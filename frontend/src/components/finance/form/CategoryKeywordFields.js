import React from 'react';
import { Button, FormGroup, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import PropTypes from 'prop-types';

class CategoryKeywordFields extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keywords: []
        };

        this.addKeyword = this.addKeyword.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleRemoved = this.toggleRemoved.bind(this);
    }

    componentDidMount() {
        this.setState({ ...this.props });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({ ...nextProps });
        }
    }

    addKeyword() {
        this.setState(prevState => ({
            keywords: [
                ...prevState.keywords,
                {
                    category: prevState.categoryPk,
                    keyword: ''
                }
            ]
        }));
    }

    toggleRemoved(idx) {
        const { keywords } = this.state;
        keywords[idx].deleted = !keywords[idx].deleted;
        this.setState({ keywords });
        this.props.onChange(keywords);
    }

    handleChange(event) {
        const { keywords } = this.state;
        keywords[event.target.dataset.id].keyword = event.target.value;
        this.setState({ keywords });
        this.props.onChange(keywords);
    }

    render() {
        return (
            <>
                {this.state.keywords &&
                    this.state.keywords.map((keyword, idx) => {
                        const keywordIdx = `keyword-${idx}`;

                        return (
                            <FormGroup key={idx}>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name={keywordIdx}
                                        data-id={idx}
                                        className="categoryKeyword"
                                        value={keyword.keyword}
                                        disabled={keyword.deleted}
                                        onChange={this.handleChange}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button onClick={() => this.toggleRemoved(idx)} color="danger">
                                            <i className="far fa-trash-alt" />
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                        );
                    })}
                <Button color="link" onClick={this.addKeyword} block>
                    <i className="fas fa-plus" /> New
                </Button>
            </>
        );
    }
}

CategoryKeywordFields.defaultProps = {
    keywords: []
};

CategoryKeywordFields.propTypes = {
    onChange: PropTypes.func.isRequired
};

export default CategoryKeywordFields;
