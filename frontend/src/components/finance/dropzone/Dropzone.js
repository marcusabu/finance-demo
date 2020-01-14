import React, { useState } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, Alert, Col, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import Loading from '../../common/Loading/Loading';
import './Dropzone.scss';
import ReactDropzone from 'react-dropzone';

function Dropzone(props) {
    const [modal, setModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);

    function uploadTransactions(e) {
        const contents = e.target.result;

        axios
            .post('finance/transactions/upload/', { contents })
            .then(res => {
                setTransactions(res.data);
                setError(false);
                props.onSuccess()
            })
            .catch(() => {
                setError(true);
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    function readFile(acceptedFiles) {
        console.log(this);
        setIsLoading(true);
        console.log(acceptedFiles[0]);
        acceptedFiles.forEach(file => {
            const r = new FileReader();
            r.onload = uploadTransactions;
            r.readAsText(file);
        }, this);
    }

    function toggleModal() {
        setModal(!modal);
        setTransactions([]);
    }

    return (
        <>
            <Button color="link" onClick={toggleModal}>
                Add transactions
            </Button>
            <Modal className="Dropzone" size="lg" isOpen={modal} toggle={toggleModal}>
                <Loading isLoading={isLoading} />
                <ModalHeader toggle={toggleModal}>Add transactions</ModalHeader>
                <ModalBody>
                    {error && (
                        <Col md={12}>
                            <Alert color="danger">
                                <b>Something went wrong</b>
                            </Alert>
                        </Col>
                    )}
                    <ReactDropzone onDrop={readFile} />
                    <ListGroup className="uploadResult">
                        {transactions.map(transaction => (
                            <ListGroupItem className="justify-content-between">
                                {transaction.title}{' '}
                                {transaction.created && (
                                    <Badge color="success" pill>
                                        New
                                    </Badge>
                                )}
                                <span className="category">{transaction.category}</span>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </ModalBody>
            </Modal>
        </>
    );
}

export default Dropzone;
