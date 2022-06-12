# this dockerfile from https://github.com/eth-brownie/brownie
FROM python:3.9

# Set up code directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install linux dependencies
RUN apt-get update && apt-get install -y libssl-dev npm

# Install Ganache chain
RUN npm install --global ganache

# Install Brownie
RUN wget https://raw.githubusercontent.com/eth-brownie/brownie/master/requirements.txt

RUN pip install -r requirements.txt && \
    pip install eth-brownie

# Create user
ARG BROWNIE_USER
RUN useradd -ms /bin/bash ${BROWNIE_USER}

USER ${BROWNIE_USER}

WORKDIR /projects

CMD [ "bash" ]
