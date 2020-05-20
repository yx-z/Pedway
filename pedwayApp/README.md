# How to deploy the pedwayApp

- Install Android SDK [here](https://developer.android.com/studio/)
- Install WebStorm [here](https://www.jetbrains.com/webstorm/), or your favorite JavaScript IDE/editor
- Install React Native CLI:
```console
$ npm install -g react-native-cli
```
- Set the sdk.dir in /pedwayApp/android/local.properties to the Android sdk's directory on your own machine
- Add an Android configuration in WebStorm and run it, or execute:
- Grant location permission for this app in Setting -> Location Services -> App-level-permission-> Chicago Pedway
```console
$ react-native run-android
```
- You can setup the environment variables by creating a .env file in the root directory
# Trouble Shooting


#### Error No.1:
```
Command failed: ./gradlew installDebug
```
**Solution:** Downgrade react native and reinstall node. Run the following:
```
$ npm install react-native@0.57.3
```
If you don't reinstall Node you will encounter the following error:
```
internal/modules/cjs/loader.js:583 
    throw err;
```
So reinstall Node:
```
$ rm -rf node_modules
$ npm install
```

#### Error No.2:
```
Exception in thread "main" java.lang.NoClassDefFoundError: javax/xml/bind/annotation/XmlSchema
```
or
```
Could not create service of type ScriptPluginFactory using BuildScopeServices.createScriptPluginFactory()
```
**Solution:** Install or switch to Java 8. The following command will display a list of all the java versions that you installed.
```
$ /usr/libexec/java_home -V
```
You will get something like this:
```
$ /usr/libexec/java_home -V
Matching Java Virtual Machines (2):
    11.0.1, x86_64:     "Java SE 11.0.1"        /Library/Java/JavaVirtualMachines/jdk-11.0.1.jdk/Contents/Home
    1.8.0_181, x86_64:  "Java SE 8"     /Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home

/Library/Java/JavaVirtualMachines/jdk-11.0.1.jdk/Contents/Home
```
Pick Java 8 and export JAVA_HOME:
```
$ export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_181`
```

#### Error No.3:
```
SDK location not found. Define location with sdk.dir in the local.properties file or with an ANDROID_HOME environment variable.
```
You will first need to know where is your sdk directory. For mac, it is usually /Users/<USERNAME>/Library/Android/sdk

**Solution 1:** Set ANDROID_HOME env variable. Run the following to edit your .bash_profile:
```
$ cd ~/
$ sudo vim .bash_profile
```
Insert the following three lines:
```
export ANDROID_HOME=/Users/<USERNAME>/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
```
Run the following to check if it works:
```
$ source ~/.bash_profile
$ echo $ANDROID_HOME
```

**Solution 2:** Create and modify local.properties in side your project/android folder.
```
$ cd project_folder/android
$ vim local.properties
```
In local.properties insert: 
```
sdk.dir = /Users/<USERNAME>/Library/Android/sdk
```

#### Error No.4:
```
Failed to install the following Android SDK packages as some licences have not been accepted.
```
**Solution:** cd to your sdk folder and use sdkmanager to accept all the licences.
```
$ cd /Users/<USERNAME>/Library/Android/sdk/tools/bin/
$ ./sdkmanager --licenses
```

#### Error No.5:
```
/bin/sh: 1: adb: not found
```

**Solution:** Install adb 
```
$ brew cask install android-platform-tools
```
if it still does not work, add the line to your .bash_profile:
```
export PATH="/Users/<USERNAME>/Library/Android/sdk/platform-tools":$PATH
```

#### Error No.6:
```
A problem occurred evaluating root project 'ReactNativeTest'.
```

**Solution:** In your build.gradle: 
```
dependencies {
        classpath 'com.android.tools.build:gradle:3.2.1'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
```

#### Error No.7:
```
Cannot add task 'wrapper' as a task with that name already exists
```

**Solution:** In your android/gradle/wrapper/gradle-wrapper.properties:
```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-5.0-all.zip
```
Comment the following lines in build.gradle:
```
task wrapper(type: Wrapper) {
    gradleVersion = '4.7'
    distributionUrl = distributionUrl.replace("bin", "all")
}
```


