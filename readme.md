# Cli tool to query cassandra database

## cqu: execute query on cassandra contactPoints with or without arguments

  ### params: (if no config defined previously used parameters will be used)

    --help         OR  -h   show help text
    --config       OR  -c   name of saved config (if no name provided "default" is used)

    --query        OR  -q   query to run on database
    --argFile      OR  -f   path to argument file
    --args         OR  -a   inline string for arguments
    --argMap       OR  -m   comma seperated maping string for maping args to query params starting from 1 example 2,1,4

    --placeholder  OR  -v   placeholder for vairable mapping (defaults to "%s")
    --argseperator OR  -s   seperator of args values (defaults to ",")
    --hosts        OR  -h   contactPoints comma seperated list of hosts for cassandra connection (defaults to "localhost")
    --keyspace     OR  -k   name space for cassandra connection
    --username     OR  -u   user name for cassandra connection
    --password     OR  -p   password for cassandra password
    --output       OR  -o   output file (if value is ommited it will be ./output.json)
    --timeout      OR  -t   timeout of the query in miliseconds (default is 5000 )

## cqu-configs (save/get parameters);
    additional configs to above minus --config (in this command it's irrelevent)
    --set  to set configs name (defaults to "default")
    --get  to get config (if value not provided it will show all configs)
    --configFile  to import or export saved config or configuration based on set or get

### Notes to consider
when defining vairables if "=" exists inside variable value you can't assign value with "="
  wrong command: cqu -q="select * from table where id=%s" -v="%s
  right command: cqu -q "select *  from table where id=%s" -v="%s
