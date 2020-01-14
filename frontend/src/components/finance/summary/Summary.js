import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Col, Alert, Row } from 'reactstrap';
import moment from 'moment';
import axios from 'axios';
import MonthSwitcher from '../../common/MonthSwitcher/MonthSwitcher';
import Loading from '../../common/Loading/Loading';
import './Summary.scss';
import Progress from './progress/Progress';

const Summary = forwardRef((props, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [lastDate, setLastDate] = useState(null);
    const [budgetSummary, setBudgetSummary] = useState([]);
    const [animationsInProgress, setAnimationsInProgress] = useState(0);

    useEffect(() => {
        console.log('use effect');
        refreshData(selectedDate, true);
    }, []);

    useImperativeHandle(ref, () => ({
        refreshData() {
            refreshData(moment(), true);
        }
    }));

    function refreshData(date, withLoading) {
        if (syncInProgress || withLoading) {
            setIsLoading(true);
        }

        const body = {
            year: date.format('YYYY'),
            month: date.format('M')
        };

        axios
            .get('finance/categories/summary/?format=json', {
                params: body
            })
            .then(res => {
                setBudgetSummary(res.data.budget_summary);
                setLastDate(res.data.last_date);
                setSyncInProgress(res.data.sync_in_progress);
                setError(false);
                setSelectedDate(date);
            })
            .catch(() => {
                setError(true);
            })
            .then(() => {
                setIsLoading(false);
            });
    }

    function onMonthChange(date) {
        refreshData(date, true);
    }

    function animationStarted() {
        setAnimationsInProgress(prevCount => {
            return prevCount + 1;
        });
    }

    function animationDone() {
        setAnimationsInProgress(prevCount => {
            return prevCount - 1;
        });
    }

    return (
        <div className="ChartComponent SummaryComponent">
            <Card className="ChartCard">
                <CardHeader>
                    <h6 className="m-0 font-weight-bold text-primary">
                        {' '}
                        Budget summary {selectedDate.format('MMMM, YYYY')}{' '}
                        {syncInProgress && (
                            <div className="h6 mb-0 font-weight-bold card bg-warning text-white shadow chartBadge">
                                Syncing
                            </div>
                        )}
                    </h6>
                </CardHeader>
                <CardBody>
                    <Loading isLoading={isLoading || syncInProgress} />
                    {error && (
                        <Alert color="danger">
                            <b>Failed to fetch summary data</b>
                        </Alert>
                    )}
                    {budgetSummary.map(summary => (
                        <Progress
                            key={summary.pk}
                            summary={summary}
                            onAnimationStarted={animationStarted}
                            onAnimationDone={animationDone}
                        />
                    ))}
                </CardBody>
                <CardFooter>
                    <Row>
                        <Col md={6}>Last transaction date: {lastDate}</Col>
                        <Col md={6}>
                            {' '}
                            <MonthSwitcher monthChange={onMonthChange} />{' '}
                        </Col>
                    </Row>
                </CardFooter>
            </Card>
        </div>
    );
});

export default Summary;
