FROM sqitch/sqitch:latest

WORKDIR /work

ENV SQITCH_PASSWORD example

COPY . .

ENTRYPOINT ["/bin/bash"]
CMD ["./migrate-up.sh"]