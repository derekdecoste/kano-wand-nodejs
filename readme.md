# Magic Photo
(and other potential magical pi projects)

## Use a wand to start and stop a Magical Photograph (it's a video)

Starts video stored at "./video/current-video/video.mp4" paused at 1 ("--start=+1" in magic-photo.js) second(s) once Kano wand is found. Toggles pause once spell "Locomotor" is cast.

## Setup
(not completed, links that I will build setup from below)

- http://mcra.t8o.org/2019/12/26/kano-coding.html
- https://flows.nodered.org/node/node-red-contrib-tf-model
- https://enricopiccini.com/en/kb/HOW_TO_RUN_TensorflowJs_in_NodeJs_on_NVidia_Jetson_Nano_arm64_-658 (not sure if these alterations ended up being neccesary)
- https://stackoverflow.com/questions/55106805/tf-loadmodel-is-not-a-function
- https://github.com/node-fetch/node-fetch/issues/481
- https://stackoverflow.com/questions/44342226/next-js-error-only-absolute-urls-are-supported
- https://gist.github.com/joshua-gould/58e1b114a67127273eef239ec0af8989 (did not use but possible node-fetch workaround if i don't want to ping my github, mention the github hardlink in the readme)
- install mpv on pi

## To do

- convert all noble operations from using callbacks to Promises
- 

## (below is readme from forked project)

## Kano Wand NodeJS

### Setup
1. Install:
    - Node
    - Npm
    - Python 2.7
    - [Zadig](https://zadig.akeo.ie/)
2. Run Zadig 
   i. From the `Options` menu, choose `List All Devices`
  ii. From the devices dropdown list, select bluetooth adapter then select `Replace Driver`
3. `npm install`
4. Copy `<root>/model/*` to `node_modules/kano-wand/model/*`
5. Run `node example-dual.js` or F5 from Visual Studio Code
 

### Contributions

Big help from
https://github.com/marcus7777/spelling
