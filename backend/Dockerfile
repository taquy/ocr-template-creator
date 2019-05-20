FROM ubuntu:16.04

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev && \
    apt-get install -y libglib2.0-0 && \
    apt-get install build-essential checkinstall cmake pkg-config yasm -y && \
    apt-get install git gfortran -y && \
    apt-get install libjpeg8-dev libjasper-dev libpng12-dev -y && \
    apt-get install libavcodec-dev libavformat-dev libswscale-dev libdc1394-22-dev -y && \
    apt-get install libxine2-dev libv4l-dev -y && \
    apt-get install libgstreamer0.10-dev libgstreamer-plugins-base0.10-dev -y && \
    apt-get install qt5-default libgtk2.0-dev libtbb-dev -y && \
    apt-get install libatlas-base-dev -y && \
    apt-get install libfaac-dev libmp3lame-dev libtheora-dev -y && \
    apt-get install libvorbis-dev libxvidcore-dev -y && \
    apt-get install libopencore-amrnb-dev libopencore-amrwb-dev -y && \
    apt-get install x264 v4l-utils -y

# We copy just the requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

ENTRYPOINT [ "python" ]

CMD [ "main.py" ]
