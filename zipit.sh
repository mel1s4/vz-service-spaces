rm -rf vz-service-spaces;
rm -rf vz-service-spaces.zip;
mkdir vz-service-spaces;
find . -maxdepth 1 -type f -exec cp {} vz-service-spaces/ \;
mkdir vz-service-spaces/service-space-single;
mkdir vz-service-spaces/service-space-single/build;
cp -r service-space-single/build vz-service-spaces/service-space-single;
zip -r vz-service-spaces.zip vz-service-spaces;
rm -rf vz-service-spaces;
