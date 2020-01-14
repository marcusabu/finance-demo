import React, { Fragment, useState } from 'react';
import { Button, Form } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import Loading from '../../../common/Loading/Loading';
import TransactionFormFields from './TransactionFormFields';
import './TransactionForm.scss';

function TransactionForm(props) {
    const [keywords, setKeywords] = useState([{ keyword: '', category: '' }]);
    const [isLoading, setIsLoading] = useState(false);

    function editField(event) {
        event.preventDefault();

        const eventIdx = event.target.dataset.id;
        const { type } = event.target;

        keywords.map((keyword, idx) => {
            if (idx.toString() === eventIdx) {
                if (type === 'text') {
                    keyword.keyword = event.target.value;
                } else if (type === 'select-one') {
                    keyword.category = event.target.value;
                }
            }
            return keyword;
        });

        setKeywords(keywords);
    }

    function submitForm(event) {
        event.preventDefault();

        keywords.filter(keyword => {
            return keyword.keyword !== '' && keyword.category !== '';
        });

        axios
            .post(`finance/keywords/create_bulk/?format=json`, {
                keywords
            })
            .then(() => {
                setKeywords([]);
                setTimeout(() => {
                    props.onRefresh();
                }, 1000);
            })
            .catch(() => {
                // TODO
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    function addForm() {
        setKeywords([
            ...keywords,
            {
                keyword: '',
                category: ''
            }
        ]);
    }

    return (
        <div className="CategoryFormGroup">
            <Form onSubmit={submitForm}>
                <Loading isLoading={isLoading} />
                <h3>Add keywords</h3>
                {keywords.map((form, idx) => {
                    return (
                        <Fragment key={idx}>
                            <TransactionFormFields form={form} idx={idx} onChange={editField} />
                        </Fragment>
                    );
                })}
                <Button outline block color="link" onClick={addForm}>
                    <i className="fas fa-plus"> </i> Add
                </Button>
                <Button block color="success">
                    <i className="far fa-save" /> Save
                </Button>
            </Form>
        </div>
    );
}

TransactionForm.propType = {
    onRefresh: PropTypes.func.isRequired
};

export default TransactionForm;
