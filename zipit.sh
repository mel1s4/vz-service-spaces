rm -rf vz-service-spaces;
rm -rf vz-service-spaces.zip;
mkdir vz-service-spaces;
find . -maxdepth 1 -type f -exec cp {} vz-service-spaces/ \;
mkdir vz-service-spaces/single;
mkdir vz-service-spaces/single/build;
cp -r single/build vz-service-spaces/single;

mkdir vz-service-spaces/archive;
mkdir vz-service-spaces/archive/build;
cp -r archive/build vz-service-spaces/archive;

mkdir vz-service-spaces/orders;
mkdir vz-service-spaces/orders/build;
cp -r orders/build vz-service-spaces/orders;

zip -r vz-service-spaces.zip vz-service-spaces;
rm -rf vz-service-spaces;
