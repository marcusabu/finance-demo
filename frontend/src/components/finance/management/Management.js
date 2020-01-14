import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import CategoryForm from '../form/CategoryForm';
import Dropzone from '../dropzone/Dropzone';
import Transactions from '../transactions/Transactions';
import './Management.scss';

function Management(props) {
    const [celeryOnline, setCeleryOnline] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);

    useEffect(() => {
        refreshData();
    }, []);

    function refreshData() {
        axios.get('finance/metadata/?format=json').then(res => {
            setCeleryOnline(res.data.celery_online);
            setSyncInProgress(res.data.sync_in_progress);
        });
    }

    return (
        <Col md={3} className="Management">
            <Card className="managementCard shadow mb-4">
                <CardHeader>
                    <h6 className="m-0 font-weight-bold text-primary">Management</h6>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col xs={6}>
                            <h4 className="small font-weight-bold">Celery</h4>
                            {celeryOnline ? (
                                <div className="h5 mb-0 font-weight-bold text-success">Online</div>
                            ) : (
                                <div className="h5 mb-0 font-weight-bold text-danger">Offline</div>
                            )}
                        </Col>
                        <Col xs={6}>
                            <h4 className="small font-weight-bold">Synchronization</h4>
                            {syncInProgress ? (
                                <div className="h5 mb-0 font-weight-bold text-warning">In progress</div>
                            ) : (
                                <div className="h5 mb-0 font-weight-bold text-success">Done</div>
                            )}
                        </Col>
                    </Row>
                    <div className="managementButtons">
                        <CategoryForm new onRefresh={props.onSuccess} />
                        <Dropzone onSuccess={props.onSuccess} />
                        <Transactions remaining onRefresh={props.onSuccess} />
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
}

Management.propTypes = {
    onSuccess: PropTypes.func.isRequired
};

export default Management;
