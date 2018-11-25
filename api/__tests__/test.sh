#! /bin/bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"id":"test","message":"test2"}' \
  http://localhost:1337/outbound

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"id":"test"}' \
  http://localhost:1337/outbound

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"message":"test2"}' \
  http://localhost:1337/outbound

curl --header "Content-Type: application/json" \
  --request POST \
  --data 'test' \
  http://localhost:1337/outbound