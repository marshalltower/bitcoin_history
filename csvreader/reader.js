const fs = require('fs');
const {pool} = require('./db/postgres');
const moment = require('moment');

const HEADERIDX = 0;
const PRICEIDX = 5;
const TIMEDELAY = process.env.MILLISECONDS || 1000;
const DELIMITER = process.env.DELIMITER || ',';
const FILE = "bitcoin_csv.csv";

const loadFile = (file) => {
    try {
        const dataBuffer = fs.readFileSync(file);//ENV
        const dataString = dataBuffer.toString();
        return dataString.split(/\r?\n/).map(ln => ln.trim()).map(idx => idx.split(DELIMITER).map(col => col.trim()));
    } catch (e) {
        console.log('Error',e)
        return [];
    }
}

const timer = ms => new Promise(res => setTimeout(res, ms));


const importData = async (data) => {
    
    const dataLines = data.length;
    console.log(dataLines-1 + ' entries found.');
    console.log(`Beginning row insertions with ${TIMEDELAY} millisecond delay`);
    for(var ln = HEADERIDX+1; ln < dataLines; ln++){
        const row = data[ln];
    
        const price = parseFloat(row[PRICEIDX]);
        if(!(price > 0)) continue;

        //sanitize
        const rowData = parseRow(row);
        const q = stringifyRowQuery(rowData);
        try {
            const res = await pool.query(q);
        } catch (e) {
            console.log('Error', e);
            process.exit();
        }
        console.log('Row entered for: ' + rowData.date.format('YYYY-MM-DD'));
        await timer(TIMEDELAY);
    }
}

//FOR EXERCISE ONLY - wipe data in database to help simulate live field data entry
const clearData = async () => {
    const q = 'DELETE FROM history';
    console.log('Clearing database table for new entries')
    const res = await pool.query(q);
}

const stringifyRowQuery = (rowData) => {
    return `INSERT INTO history VALUES (
        '${rowData.date.format('YYYY-MM-DD')}',
        ${rowData.txVolumne},
        ${rowData.adjustedTxVolume},
        ${rowData.txCount},
        ${rowData.marketCap},
        ${rowData.price},
        ${rowData.exchangeVolume},
        ${rowData.generatedCoins},
        ${rowData.fees},
        ${rowData.activeAddresses},
        ${rowData.averageDifficulty},
        ${rowData.paymentCount},
        ${rowData.medianTxValue},
        ${rowData.medianFee},
        ${rowData.blockSize},
        ${rowData.blockCounts})`;
}

const parseRow = (row) => {
    return {
        date : moment(row[0]),
        txVolumne : parseFloat(row[1]) || null,
        adjustedTxVolume : parseFloat(row[2]) || null,
        txCount : parseInt(row[3]) || null,
        marketCap : parseFloat(row[4]) || null,
        price : parseFloat(row[PRICEIDX]) || null,
        exchangeVolume : parseFloat(row[6]) || null,
        generatedCoins : parseFloat(row[7]) || null,
        fees : parseFloat(row[8]) || null,
        activeAddresses : parseInt(row[9]) || null,
        averageDifficulty : parseFloat(row[10]) || null,
        paymentCount : parseInt(row[11]) || null,
        medianTxValue : parseFloat(row[12]) || null,
        medianFee : parseFloat(row[13]) || null,
        blockSize : parseInt(row[14]) || null,
        blockCounts : parseInt(row[15]) || null
    }
}

const main = async () => {
    const data = loadFile(FILE);
    await clearData();//FOR EXERCISE ONLY
    await importData(data);    
}

main();