import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function ChartDelete(props) {
    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    return (
        <>
            <Button color="link" size="sm" onClick={toggle}>
                <i className="far fa-trash-alt" />
            </Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Confirmation</ModalHeader>
                <ModalBody>Do you really want to delete this category?</ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        onClick={() => {
                            props.onDelete();
                            toggle();
                        }}
                    >
                        Delete
                    </Button>{' '}
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

ChartDelete.propTypes = {
    onDelete: PropTypes.func.isRequired
};

export default ChartDelete;
