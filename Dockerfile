FROM pypy:3.10-7-slim as python-base
WORKDIR /app
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        curl \
        build-essential \
        python-dev \
        libpq-dev \
        nodejs \
        npm

COPY package.json /app/package.json
COPY requirements.txt /app/requirements.txt

RUN npm install
RUN pip install -r requirements.txt
COPY . /app
