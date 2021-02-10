import React from 'react';
import {Chart} from 'react-chartjs-2';
import Axios from 'axios';
import {io} from 'socket.io-client';


const socket = io();
const chartOptions = {
    maintainAspectRatio: false,
    title: {
        display: true,
        text: 'Bitcoin History',
        fontColor: '#fff',
        fontSize: 24,
        fontStyle: 'bold',
        padding: 30
    },
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            gridLines: {
                display: true,
                color: '#061a36',
                lineWidth: 1.5,
                borderDash: [4,4],
                drawBorder: false,
                zeroLineWidth: 0,
                drawTicks: false,
                maxTicksLimit: 15,
                z: 1
            },
            type: 'time',
            time: {
                unit: 'day',
                displayFormats: {
                    day: 'MMM D',
                    week: 'll',
                    month: 'MMM YYYY',
                    quarter: '[Q]Q - YYYY',
                    year: 'YYYY'
                }
            },
            scaleLabel: {
                fontColor: '#f90',
                display: true,
                padding: 15,
                labelString: 'Date',
                fontSize: 14,
                fontStyle: 'bold'
            },
            ticks: {
                fontColor: '#fff',
                padding: 20
            }
        }],
        yAxes: [{
            gridLines: {
                display: false
            },
            scaleLabel: {
                fontColor: '#f90',
                display: true,
                labelString: 'Price (USD)',
                fontSize: 14,
                fontStyle: 'bold',
                padding: 20
            },
            ticks: {
                fontColor: '#fff',
                padding: 5,
                beginAtZero: true,
                source: 'auto',
                callback: function(value, idx, values){
                    return '$' + value;
                }
            }
        }]
    }
};

class App extends React.Component{

    constructor(props){
        super(props);
        this.chartReference = React.createRef();
    }

    componentDidMount(){
        const historyRef = this.chartReference.current.getContext("2d");

        Chart.defaults.global.defaultFontFamily = 'sans-serif';
        const chart = new Chart(historyRef, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "Prices",
                        borderColor: '#061a36 ',
                        backgroundColor: 'rgba(17,83,166,.5)',
                        pointBackgroundColor: '#041224',
                        pointBorderWidth: 2.5,
                        pointRadius: 3,
                        borderWidth: 2.5
                    }
                ]
            },
            options: chartOptions
        })
        Axios.get('/api/history').then(({data}) => {
            chart.data.labels = Object.keys(data);
            chart.data.datasets[0].data = Object.values(data); 
            chart.update();

            socket.on('newItem', (newItem) => {
                chart.data.labels.push(Object.keys(newItem)[0]);
                chart.data.datasets[0].data.push(Object.values(newItem)[0]);
                chart.update();
            })
        });
    }

    render(){
        return (
            <div className='ui middle aligned center aligned grid' style={{height: '100%'}}>
                <div className='column' style={{paddingBottom: 0}}>
                    <div className='ui large' style={{paddingRight: 40}}>
                        <canvas id='history' ref={this.chartReference} width='400' height='600'/>                        
                    </div>
                </div>
            </div>
        )
    };
}

export default App;