# Welcome to my assignment!

## Sections:
 - csvreader
 - dbsrv
 - websrv

### CSVREADER
This image takes the provided **bitcoin_csv.csv** and **bind mounts** it into the container at the required directory **"/usr/src/app/"**.

The script loads data into the **history table** of the **bitcoin database** already created in '***dbsrv***'. As such the '***dbsrv'*** **container must be deployed** in order to connect and send data. Data is sent over private network so no open ports are necessary (although it could be changed for real work deployment).

Uses the minimalist node alpine image as this runs as a node app and only requires the build in filesystem module as well as a postgres module for database access and moment module for easy date handling/parsing.

#### **NOTE: The app wipes the history database it writes to upon each start so that you can continuously reset at any moment. 

The postgres config file included in the build includes default values for the following items:
 - user : 'postgres'
 - host : ***'dbsrv'***
 - database: 'bitcoin'
 - port: '5432'
 
#### 'DB_PASSWD' is a required environment variable.

Additional environment variables are available if you would like to overwrite for user, host, and port. They are respectively 'DB_USER', 'DB_HOST', 'DB_PORT'.

*The postgres config file is the same as used for **'websrv'**.*

The main reader.js script is run using 'forever' instead of 'node' to keep the addition of new content in a repeating loop. It can be terminated at any time without issue.

Two additional environment variables with default values are included for easy of use (i,e. they are optional). They include:

 - DELIMITER (character based)
 - MILLISECONDS
 
The **MILLISECONDS** environment variable has been included in the docker-compose to allow easy changing whether you would like to slow things down to see changes more easily or speed things up to upload all data.

### DBSRV

Uses a standard postgres image. 

A **initialization sql script is included** in the build and placed as required in "/docker-entrypoint-initdb.d/" as per official documentation. For new containers it will create the database, table, and listen/notify functions for *live syncing*.

A volume is used to maintain database information but given that ***'csvreader'*** can wipe and rebuild the data, the volume can be removed at any time and the initialization sql script will remake the volume as needed. **Volume is stored as per the official documentation at '/var/lib/postgresql/data'.**

Given that both ***'csvreader'*** and ***'websrv'*** use the database, ***'dbsrv'*** **should be the  first deployed** and is setup as such in the docker-compose using 'depends_on'.

Postgres uses the default 'postgres' user and **requires the "POSTGRES_PASSWORD"** environment variable for setup. If the password is changed please verify with the required database password environment variable required both in the ***"csvreader"*** and ***"websrv"*** images.

### WEBSRV
This build uses the full node image just in case as it includes a full express server and react frontend. 

This is the only image that exposes a public port and uses **port "80"** for easy of use (i.e. the webpage can be **access via localhost in the browser** without specifying which port). 

A react frontend is served up as the public static files for use by the express backend. Requests are made to route '/api/history' to grab all initial graph data with additional **new items provided *live* via *websockets*** as they are entered into ***'dbsrv'*** .  As such '***websrv'*** is *not dependent on data or timing* from ***'csvreader'*** and will provide whatever is available at the time for a long as the webpage is used. 

**"DB_PASSWD" is the only required environment variable** for use with the postgres database; however, as mentioned in **'csvreader'** additional database related environment variables can be provide to overwrite default values. 

The main 'server.js' script is also run via 'forever' to keep the server up and running although given that the chart data is pulled from the database it is recommend that ***'dbsrv'*** **is up and running beforehand**.