# flow-logs

This project is created to parse network flow logs and lookup csv tables and count mapping for each tag and port-protocol combinations.

This is an npm project which would require installing the packages. There is only one package required to run
this codebase:


`csv-parser`

To install this project, execute this command:

`npm install`

Once the packages have been installed, we can start using the flow-logs application.

The command to complile and execute this application is:

`node app.js <flow_logs_file> <lookup_file> <output_file>`

1. `<flow_logs_file>` : the absolute path to the text file which contains all the flow logs.


2. `<lookup_file>`: the absolute path to the lookup csv file.


3. `<output_file>`: the absolute path to where the groupings and counts should be printed.


Assumptions and FYIs:
1. I have created a separate [protocols.js](./protocols.js) file for commonly used protocols. Currently it only contains 
tcp, udp, and icmp. If you are testing with way more protocols, please add them to the [protocols.js](./protocols.js) file before testing your flow logs.