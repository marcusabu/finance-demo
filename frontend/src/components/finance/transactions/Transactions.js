import React, { useState, forwardRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Table, Col, Row, Alert } from 'reactstrap';
import axios from 'axios';
import moment from 'moment';
import PropTypes from 'prop-types';
import Loading from '../../common/Loading/Loading';
import MonthSwitcher from '../../common/MonthSwitcher/MonthSwitcher';
import TransactionForm from './TransacionForm/TransactionForm';
import './Transactions.scss';

const Transactions = forwardRef((props, ref) => {
    const [modal, setModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    function fetchTransactions(date) {
        setIsLoading(true);

        date = date === undefined ? moment() : date;
        setSelectedDate(date);

        let url;
        const body = {
            year: date.format('YYYY'),
            month: date.format('M')
        };

        if (props.remaining) {
            url = 'finance/transactions/remaining/?format=json';
        } else {
            url = `finance/categories/${props.pk}/transactions/?format=json`;
        }

        axios
            .get(url, {
                params: body
            })
            .then(res => {
                setTransactions(res.data);
            })
            .catch(() => {
                setError(true);
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    function changeMonth(date) {
        setSelectedDate(date);
        fetchTransactions(date);
    }

    function toggleModal() {
        const modalIsOpening = !modal;

        if (modalIsOpening) {
            if (transactions.length === 0) {
                fetchTransactions(selectedDate);
            }
            changeMonth(moment());
        }
        setModal(!modal);
    }

    function disableTransaction(pk) {
        setIsLoading(true);
        const url = `finance/transactions/${pk}/?format=json`;
        axios
            .delete(url)
            .then(() => {
                props.onRefresh();
            })
            .catch(() => {
                setError(true);
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    return (
        <>
            {props.remaining && (
                <Button color="link" onClick={toggleModal}>
                    Remaining transactions
                </Button>
            )}
            {!props.remaining && (
                <Button color="link" size="sm" onClick={toggleModal}>
                    <i className="fas fa-list-ul" />
                </Button>
            )}
            <Modal className="Transactions" size="lg" isOpen={modal} toggle={toggleModal}>
                <ModalHeader>Transaction overview</ModalHeader>
                <ModalBody>
                    <Loading isLoading={isLoading} />
                    <Row>
                        <Col>
                            {transactions && (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Title</th>
                                            <th>Amount</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    {error && (
                                        <Alert color="danger">
                                            <b>Failed to fetch transactions</b>
                                        </Alert>
                                    )}
                                    {transactions.map(transaction => (
                                        <tbody key={transaction.pk}>
                                            <tr className={transaction.deleted ? 'deleted' : ''}>
                                                <td>{transaction.date}</td>
                                                <td>
                                                    {transaction.title} {transaction.deleted}
                                                </td>
                                                <td>
                                                    <b>{transaction.amount}</b>
                                                </td>
                                                {/* TODO: positive class */}
                                                <td>
                                                    <Button
                                                        color="danger"
                                                        onClick={() => {
                                                            transaction.deleted = !transaction.deleted;
                                                            disableTransaction(transaction.pk);
                                                        }}
                                                    >
                                                        <i className="fa fa-trash" aria-hidden="true" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </Table>
                            )}
                        </Col>
                        {/*TODO needs better testing*/}
                        {/*{props.remaining && (*/}
                        {/*    <Col md={4}>*/}
                        {/*        <TransactionForm onRefresh={props.onRefresh} />*/}
                        {/*    </Col>*/}
                        {/*)}*/}
                    </Row>
                    <MonthSwitcher monthChange={changeMonth} />
                </ModalBody>
            </Modal>
        </>
    );
});

Transactions.defaultProps = {
    pk: null
};

Transactions.propTypes = {
    remaining: PropTypes.bool.isRequired,
    pk: PropTypes.number,
    onRefresh: PropTypes.func.isRequired
};

export default Transactions;
