FROM rust:buster

WORKDIR /usr/src/app
COPY . .

RUN cargo install --path .

CMD ["target/release/csv_reader","< bitcoin_csv.csv"]