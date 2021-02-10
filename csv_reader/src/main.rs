use std::io;
use std::time::Duration;
use std::thread::sleep;
use std::env;
use csv;
use serde::Deserialize;
use postgres::{Client, NoTls};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DailyData {
    date: String,
    #[serde(alias = "txVolume(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    tx_volume: Option<f64>,
    #[serde(alias = "adjustedTxVolume(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    adjusted_tx_volume: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    tx_count: Option<i32>,
    #[serde(alias = "marketcap(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    marketcap: Option<f64>,
    #[serde(alias = "price(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    price: Option<f64>,
    #[serde(alias = "exchangeVolume(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    exchange_volume: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    generated_coins: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    fees: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    active_addresses: Option<i32>,
    #[serde(deserialize_with = "csv::invalid_option")]
    average_difficulty: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    payment_count: Option<i32>,
    #[serde(alias = "medianTxValue(USD)")]
    #[serde(deserialize_with = "csv::invalid_option")]
    median_tx_value: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    median_fee: Option<f64>,
    #[serde(deserialize_with = "csv::invalid_option")]
    block_size: Option<i32>,
    #[serde(deserialize_with = "csv::invalid_option")]
    block_count: Option<i16>
}

fn read_file() -> Vec<DailyData> {
    let mut reader = csv::Reader::from_reader(io::stdin());

    let mut rows: Vec<DailyData> = Vec::new();

    for line in reader.deserialize() {
        let row: DailyData = line.unwrap();
        
        if row.price.is_none() {
            continue;
        }

        rows.push(row);
    }

    rows
}

fn main() {
    let milliseconds:u64 = match env::var("MILLISECONDS") {
        Ok(val) => val.parse().unwrap(),
        Err(_) => 1000,
    };

    let data: Vec<DailyData> = read_file();

    let mut client = match Client::connect("host=localhost user=postgres password=P@ssw0rd! dbname=bitcoin ", NoTls) {
        Ok(c) => c,
        Err(e) => panic!("Cannot connect to database: {:?}", e),
    };
    client.batch_execute("DELETE FROM history").unwrap();

    for line in data.iter() {
        let query: String = row_to_sql_string(line);
        match client.batch_execute(&query){
            Ok(_) => println!("Data entered for date: {:?}", line.date),
            Err(_) => eprintln!("Could not enter data for date: {:?}", line.date),
        };
        sleep(Duration::from_millis(milliseconds));
    }
}

fn row_to_sql_string(data: &DailyData) -> String {
    let q: String = format!("INSERT INTO history VALUES ('{}',{},{},{},{},{},{},{},{},{},{},{},{},{},{},{})",
        data.date,
        data.tx_volume.unwrap(),
        data.adjusted_tx_volume.unwrap(),
        data.tx_count.unwrap(),
        data.marketcap.unwrap(),
        data.price.unwrap(),
        data.exchange_volume.unwrap(),
        data.generated_coins.unwrap(),
        data.fees.unwrap(),
        data.active_addresses.unwrap(),
        data.average_difficulty.unwrap(),
        data.payment_count.unwrap(),
        data.median_tx_value.unwrap(),
        data.median_fee.unwrap(),
        data.block_size.unwrap(),
        data.block_count.unwrap()
    );

    q
}