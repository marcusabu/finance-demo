import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Alert } from 'reactstrap';
import Chart from './chart/Chart';
import Summary from './summary/Summary';
import './Finance.scss';
import Management from './management/Management';

export const CategoryContext = React.createContext({ categories: [] });

function Finance() {
    const [error, setError] = useState(false);
    const [categories, setCategories] = useState([]);
    const summaryRef = useRef();

    useEffect(() => {
        refreshData(true);
    }, []);

    function refreshData(firstRender) {
        axios
            .get('finance/categories/?format=json')
            .then(res => {
                setError(false);
                setCategories(res.data);
                if (!firstRender) {
                    refreshSummary();
                }
            })
            .catch(error => {
                setError(true);
                console.error(error);
            });
    }

    function refreshSummary() {
        summaryRef.current.refreshData();
    }

    return (
        <CategoryContext.Provider value={categories}>
            <Container fluid className="FinanceComponent">
                <div className="financeHeaderColor" />
                <Row className="financeHeader">
                    <Management onSuccess={refreshData} />
                    <Col md={9} lg={9}>
                        <Summary ref={summaryRef} />
                    </Col>
                </Row>
                <Row className="chartContainer">
                    {error && (
                        <Col md={12}>
                            <h1>Backend offline</h1>
                        </Col>
                    )}
                    {categories.map(category => (
                        <Chart
                            key={category.pk}
                            pk={category.pk}
                            title={category.title}
                            syncInProgress={category.sync_in_progress}
                            onChange={refreshSummary}
                        />
                    ))}
                </Row>
            </Container>
        </CategoryContext.Provider>
    );
}

export default Finance;
