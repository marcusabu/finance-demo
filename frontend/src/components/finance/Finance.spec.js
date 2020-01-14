import React from 'react';
import { shallow, mount } from 'enzyme';
import Finance from './Finance';
import axios from 'axios';
import Chart from './chart/Chart';

jest.mock('axios');

xdescribe('Finance', () => {
    describe('refreshData', () => {
        it('gets the data from the backend', done => {
            axios.get.mockImplementation(() =>
                Promise.resolve({
                    data: [
                        {
                            pk: 2,
                            title: 'Augustinus/Kartel',
                            sync_in_progress: false
                        },
                        {
                            pk: 3,
                            title: 'Boodschappen',
                            sync_in_progress: false
                        }
                    ]
                })
            );
            const wrapper = shallow(<Finance />);

            setImmediate(() => {
                expect(wrapper.state('categories')).toHaveLength(2);
                expect(wrapper.state('categories')[0].pk).toBe(2);
                expect(wrapper.state('categories')[1].title).toBe('Boodschappen');
                expect(wrapper.state('error')).toBe(false);
                done();
            }, done.fail);
        });

        it('shows an error when the data fetching fails', done => {
            axios.get.mockImplementation(() => Promise.reject('Error'));
            const wrapper = shallow(<Finance />);

            setImmediate(() => {
                expect(wrapper.state('categories')).toHaveLength(0);
                expect(wrapper.state('error')).toBe(true);
                done();
            }, done.fail);
        });
    });
});
