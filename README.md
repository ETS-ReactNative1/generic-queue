This project is a template for generic queue based applications (like ifood but extendable to any market niche). A preview of the running application can be seen here: https://youtu.be/RyfnZqqZEYg

To run the local application it is necessary to have installed:
1. Docker/Docker-compose;
2. an AVD emulator (I used the one provided by Android Studio);
3. NodeJS (version >=16.X)

To run the application you need to:
1. Run ```init_env.sh``` script or install npm dependencies in ```backend/```, ```frontend/``` and ```mobile/```;
2. copy the files ```.env.example``` as ```.env``` and ```AndroidManifest.xml.example``` as ```AndroidManifest.xml``` and fill with your keys;
3. run ```docker-compose up``` in the project root to run the backend and frontend;
4. Open AVD emulator or connect your Android device;
5. run ```react-native start``` in mobile/
6. run ```react-native run-android``` on mobile/
