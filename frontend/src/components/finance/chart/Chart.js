import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardBody, CardHeader, CardFooter, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Spring, Transition } from 'react-spring/renderprops';
import Loading from '../../common/Loading/Loading';
import CategoryForm from '../form/CategoryForm';
import Transactions from '../transactions/Transactions';
import chartOptions from './chartOptions';
import './Chart.scss';
import ChartDelete from './ChartDelete/ChartDelete';

function Chart(props) {
    const [isLoading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [chartData, setChartData] = useState({});
    const [keywords, setKeywords] = useState([]);
    const [budget, setBudget] = useState(0);
    const transactionRef = useRef(null);

    function refreshData() {
        setLoading(true);

        axios
            .get(`finance/categories/${props.pk}/?format=json`)
            .then(res => {
                if (chartData.datasets.length > 0) {
                    props.onChange();
                }
                setChartData(res.data.chart_data);
                setKeywords(res.data.keywords);
                setBudget(res.data.budget);
                setSyncInProgress(res.data.sync_in_progress);
                if (transactionRef.current) {
                    transactionRef.current.fetchTransactions();
                }
            })
            .catch(error => {
                setHasError(true);
                console.error(error);
            })
            .then(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (syncInProgress) {
                refreshData();
            }
        }, 10000);
        return () => {
            clearInterval(interval);
        };
    }, [isLoading, syncInProgress]);

    function deleteChart() {
        axios
            .delete(`finance/categories/${props.pk}/?format=json`)
            .then(() => {
                // TODO: return new state in this call
                props.onChange();
                setIsDeleted(true);
            })
            .catch(() => {
                // TODO
            })
            .then(() => {});
    }

    function getSyncBadge(transitionProps) {
        return (
            <div
                style={transitionProps}
                className="h6 mb-0 font-weight-bold card bg-warning text-white shadow chartBadge"
            >
                {' '}
                Syncing
            </div>
        );
    }

    function getAmountBadge(transitionProps) {
        if (chartData.datasets && chartData.datasets.length > 0) {
            let amount = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
            amount = amount || 0;
            return (
                <Spring from={{ number: 0 }} to={{ number: amount }}>
                    {springProps => (
                        <div style={transitionProps} className="h5 mb-0 font-weight-bold text-gray-800 chartBadge">
                            €{Math.round(springProps.number)}
                        </div>
                    )}
                </Spring>
            );
        }
        return null;
    }

    return (
        <div className="ChartComponent col-xs-12 col-md-6 col-lg-4" style={{ display: isDeleted ? 'none' : 'block' }}>
            <Card className="shadow mb-4">
                <CardHeader>
                    <h6 className="m-0 font-weight-bold text-primary">
                        {props.title}
                        <Transition
                            items={syncInProgress}
                            from={{ transform: 'translate3d(0,-20px,0)', opacity: 0 }}
                            enter={{ transform: 'translate3d(0,0px,0)', opacity: 1 }}
                            leave={{ transform: 'translate3d(0,20px,0)', opacity: 0 }}
                            config={{
                                tension: 500,
                                friction: 40
                            }}
                        >
                            {syncInProgress =>
                                syncInProgress
                                    ? springProps => getSyncBadge(springProps)
                                    : springProps => getAmountBadge(springProps)
                            }
                        </Transition>
                        {}
                    </h6>
                </CardHeader>
                <CardBody>
                    <Loading isLoading={isLoading || syncInProgress} />
                    {hasError && <h1>Failed to fetch chart data</h1>}
                    <div className="lineWrapper">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </CardBody>
                <CardFooter>
                    <CategoryForm
                        pk={props.pk}
                        title={props.title}
                        budget={budget}
                        keywords={keywords}
                        new={false}
                        onRefresh={refreshData}
                        onDelete={deleteChart}
                    />{' '}
                    <Transactions onRefresh={refreshData} remaining={false} pk={props.pk} />{' '}
                    {/* <Transactions ref={transactionRef} onRefresh={refreshData} remaining={false} pk={props.pk} />{' '} */}
                    <ChartDelete onDelete={deleteChart} />
                    {/* <Button color="link" onClick={() => setSyncInProgress(!syncInProgress)}> */}
                    {/*    Sync toggle */}
                    {/* </Button> */}
                </CardFooter>
            </Card>
        </div>
    );
}

Chart.propTypes = {
    pk: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Chart;
