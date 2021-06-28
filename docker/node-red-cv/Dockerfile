FROM nodered/node-red

USER root

RUN apk update && apk upgrade 
# RUN apt-get install libopencv-dev
# Add Edge repos
RUN echo -e "\n\
@edgemain http://nl.alpinelinux.org/alpine/edge/main\n\
@edgecomm http://nl.alpinelinux.org/alpine/edge/community\n\
@edgetest http://nl.alpinelinux.org/alpine/edge/testing"\
  >> /etc/apk/repositories

# Install required packages
RUN apk update && apk upgrade && apk --no-cache add \
  bash \
  build-base \
  ca-certificates \
  clang-dev \
  clang \
  cmake \
  coreutils \
  curl \ 
  freetype-dev \
  ffmpeg-dev \
  ffmpeg-libs \
  gcc \
  g++ \
  git \
  gettext \
  lcms2-dev \
  libavc1394-dev \
  libc-dev \
  libffi-dev \
  libjpeg-turbo-dev \
  libpng-dev \
  libressl-dev \
  libtbb@edgecomm \
  libtbb-dev@edgecomm \
  libwebp-dev \
  linux-headers \
  make \
  musl \
  openblas@edgecomm \
  openblas-dev@edgecomm \
  openjpeg-dev \
  openssl \
  python3 \
  python3-dev \
  tiff-dev \
  unzip \
  zlib-dev


# Python 3 as default
RUN ln -s /usr/bin/python3 /usr/local/bin/python && \
  ln -s /usr/bin/pip3 /usr/local/bin/pip 
RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

RUN chmod -R 777 /opt
USER node-red

RUN  pip install --upgrade pip

# Install NumPy
RUN pip install numpy

# Install OpenCV
RUN cd /opt && \
  wget https://github.com/opencv/opencv/archive/3.2.0.zip && \
  unzip 3.2.0.zip && rm 3.2.0.zip 
RUN  wget https://github.com/opencv/opencv_contrib/archive/3.2.0.zip && \
  unzip 3.2.0.zip && rm 3.2.0.zip 

RUN  cd /opt/opencv-3.2.0 && mkdir build && cd build && \
  cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_C_COMPILER=/usr/bin/clang \
    -D CMAKE_CXX_COMPILER=/usr/bin/clang++ \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_PYTHON_EXAMPLES=OFF \
    -D INSTALL_C_EXAMPLES=OFF \
    -D WITH_FFMPEG=ON \
    -D WITH_TBB=ON \
    -D OPENCV_EXTRA_MODULES_PATH=/opt/opencv_contrib-3.2.0/modules \
    -D PYTHON_EXECUTABLE=/usr/local/bin/python \
    .. \
  && \
  make -j$(nproc) && make install && cd .. && rm -rf build \
  && \
  cp -p $(find /usr/local/lib/python3.5/site-packages -name cv2.*.so) \
   /usr/lib/python3.5/site-packages/cv2.so && \
   python -c 'import cv2; print("Python: import cv2 - SUCCESS")'



# Copy package.json to the WORKDIR so npm builds all
# of your added nodes modules for Node-RED
COPY package.json .
RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production

# Copy _your_ Node-RED project files into place
# NOTE: This will only work if you DO NOT later mount /data as an external volume.
#       If you need to use an external volume for persistence then
#       copy your settings and flows files to that volume instead.
# COPY settings.js /data/settings.js
# COPY flows_cred.json /data/flows_cred.json
# COPY flows.json /data/flows.json

# You should add extra nodes via your package.json file but you can also add them here:
#WORKDIR /usr/src/node-red

RUN npm install node-red-contrib-image-tools node-red-contrib-image-output node-red-contrib-browser-utils node-red-contrib-media-utils
RUN npm install node-red-contrib-opencv node-red-contrib-face-recognition

