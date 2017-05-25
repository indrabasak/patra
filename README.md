[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Build Status][travis-badge]][travis-badge-url]

![](./src/images/logo-paleblue-candara_215px.png)

**Patra** project visualizes [Dropwizard Metrics](http://metrics.dropwizard.io/) in a user friendly way.
Dropwizard metrics are formerly known as Coda Hale / Yammer metrics.

Patra is a collection of HTML, JavaScript, and CSS files that dynamically generates pages for viewing metrics.


## Get Started
Download the HTML, JavaScript and CSS files from the [dist](dist) directory. 

To use Patra, take a look at the [index.html](dist/index.html) page and customize it by modifying the URL 
in the `patra.init` method. By default, it points to `http://localhost:8080/metrics/metrics`

```javascript
patra.init('http://localhost:8080/metrics/metrics');
```
## Dependencies
The MetricsViewer depends on the following libraries:
1. [MetricsViewer.js](https://indrabasak.github.io/metrics-viewer/) is a JavaScript library for displaying Dropwizard Metrics data as line graphs. 
2. [MetricsGraphics.js](http://metricsgraphicsjs.org) is a JavaScript library for visualizing time-series data.
3. [D3](http://d3js.org) is a JavaScript library for manipulating documents based on data. MetricsGraphics.js is based on D3 library.
4. [jQuery](http://jquery.com/) is a quintessential JavaScript library for manipulating HTML documents.
5. [jsTree](https://www.jstree.com/) is a JavaScript library for creating interactive trees.

# Build
1. Check out the [project](https://github.com/indrabasak/metrics-viewer).
2. Install [Node.js](http://nodejs.org).
3. Install [gulp](http://gulpjs.com) from the project root directory.
```    
    npm install gulp
```
4. Install the library's dependencies:
``` 
    npm install
``` 
5. To build the Javascript library, type:
``` 
    gulp build:js
```     
P.S. If your OS does not recognize gulp, trying installing command line interface of gulp by typing:
``` 
    npm install --global gulp-cli
``` 
6. To build the css library, type
```     
    gulp build:css
```     
7. To build everything at the same time, type
```   
    gulp
``` 
8. To build with Google closure compiler, type
```   
    gulp compile
``` 
9. To unit test, type
```   
    gulp test
``` 
# License

The __Patra__ code is shared under the terms of [Apache License v2.0](https://opensource.org/licenses/Apache-2.0).

[travis-badge]: https://travis-ci.org/indrabasak/patra.svg?branch=master
[travis-badge-url]: https://travis-ci.org/indrabasak/patra

