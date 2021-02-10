CREATE DATABASE bitcoin;

\c bitcoin

CREATE TABLE history (
    "date" date,
    tx_vol money,
    adj_tx_vol money,
    tx_count integer,
    mrktcap money,
    price money,
    exch_vol money,
    gen_coins double precision,
    fees double precision,
    active_addr integer,
    avg_difficulty double precision,
    pymt_count integer,
    med_tx_val money,
    med_fee double precision,
    block_size integer,
    block_count smallint,
    PRIMARY KEY (date)
);

COMMENT ON COLUMN history.tx_vol IS 'USD';
COMMENT ON COLUMN history.adj_tx_vol IS 'USD';
COMMENT ON COLUMN history.mrktcap IS 'USD';
COMMENT ON COLUMN history.price IS 'USD';
COMMENT ON COLUMN history.exch_vol IS 'USD';
COMMENT ON COLUMN history.med_tx_val IS 'USD';

CREATE OR REPLACE FUNCTION notify_new_history_item() 
    RETURNS trigger AS
$BODY$
    BEGIN
        PERFORM pg_notify('new_item', row_to_json(NEW)::text);
        RETURN NEW;
    END;
$BODY$
    LANGUAGE plpgsql STABLE
    COST 100;

CREATE TRIGGER history_item_added
    AFTER INSERT
    ON history
    FOR EACH ROW
    EXECUTE PROCEDURE notify_new_history_item();