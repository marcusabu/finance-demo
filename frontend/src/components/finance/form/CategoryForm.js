import React from 'react';
import {
    Button,
    Form,
    FormGroup,
    Input,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert
} from 'reactstrap';

import axios from 'axios';
import PropTypes from 'prop-types';
import Loading from '../../common/Loading/Loading';
import CategoryKeywordFields from './CategoryKeywordFields';
import './CategoryForm.scss';

class CategoryForm extends React.Component {
    // noinspection DuplicatedCode
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            loading: false,
            new: this.props.new,
            budget: this.props.budget,
            keywords: this.props.keywords,
            pk: this.props.pk,
            visible: true,
            title: this.props.title
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ keywords: nextProps.keywords, budget: nextProps.budget });
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleKeywordChange(keywords) {
        this.setState({ keywords });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true });

        const body = {
            title: this.state.title,
            keywords: this.state.keywords,
            budget: this.state.budget
        };

        if (this.state.new) {
            axios
                .post('finance/categories/?format=json', body)
                .then(() => {
                    this.setState({
                        modal: false,
                        loading: false,
                        title: '',
                        keywords: [],
                        budget: ''
                    });
                    setTimeout(() => {
                        this.props.onRefresh();
                    }, 1000);
                })
                .catch(() => {
                    // TODO
                })
                .then(() => {
                    this.setState({ loading: false });
                });
        } else {
            axios
                .put(`finance/categories/${this.state.pk}/?format=json`, body)
                .then(res => {
                    this.setState({ ...res.data, modal: false });
                    setTimeout(() => {
                        this.props.onRefresh();
                    }, 1000);
                })
                .catch(res => {
                    this.setState({ errorMessage: res });
                })
                .then(() => {
                    this.setState({ loading: false });
                });
        }
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    render() {
        return (
            <div className="CategoryForm">
                {this.state.new && (
                    <Button color="link" onClick={this.toggleModal}>
                        Add category
                    </Button>
                )}
                {!this.state.new && (
                    <Button color="link" size="sm" onClick={this.toggleModal}>
                        <i className="far fa-edit" />
                    </Button>
                )}
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <Loading isLoading={this.state.loading} />
                    <Form onSubmit={this.handleSubmit}>
                        <ModalHeader toggle={this.toggleModal}>
                            {this.state.new && 'Add category'}
                            {!this.state.new && 'Edit category'}
                        </ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col md="6">
                                    <h3>Title</h3>
                                    <FormGroup>
                                        <Input
                                            name="title"
                                            id="title"
                                            value={this.state.title}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <h3>Budget</h3>
                                    <FormGroup>
                                        <Input name="budget" value={this.state.budget} onChange={this.handleChange} />
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <h3>Keywords</h3>
                                    <CategoryKeywordFields
                                        keywords={this.state.keywords}
                                        categoryPk={this.state.pk}
                                        onChange={this.handleKeywordChange}
                                    />
                                </Col>
                                <Col md="12">
                                    {this.state.errorMessage && (
                                        <Alert color="danger" isOpen={this.state.visible}>
                                            <b>The changes could not be saved:</b>
                                            <br />
                                            {this.state.errorMessage}
                                        </Alert>
                                    )}
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="success">
                                <i className="far fa-save" /> Save
                            </Button>
                            <Button onClick={this.toggleModal}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </Modal>
            </div>
        );
    }
}

CategoryForm.defaultProps = {
    keywords: [],
    budget: '',
    pk: '',
    title: ''
};

CategoryForm.propTypes = {
    new: PropTypes.bool.isRequired,
    budget: PropTypes.any,
    keywords: PropTypes.arrayOf(PropTypes.object),
    pk: PropTypes.any,
    title: PropTypes.string,
    onRefresh: PropTypes.func.isRequired
};

export default CategoryForm;
