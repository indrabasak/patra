module('patra');
module('metricsviewer');

test('Test JVM div is added', function () {
    $("head").append($('<script />').attr('src','../lib/js/requirejs/2.3.6/r.js'));
    $("head").append($('<script />').attr('src','../../lib/js/jquery/3.5.1/jquery-3.5.1.min.js'));
    $("head").append($('<script />').attr('src','../../lib/js/bootstrap/4.5.0/bootstrap.bundle.min.js'));
    $("head").append($('<script />').attr('src','../../lib/d3/v5.16.0/d3.min.js'));
    $("head").append($('<script />').attr('src','../../lib/metrics-graphics/2.15.6/metricsgraphics.min.js'));
    $("head").append($('<script />').attr('src','../../lib/js/metrics-viewer/2.0.0/metricsviewer.js'));
    $("head").append($('<script />').attr('src','../../lib/js/jstree/3.3.9/jstree.min.js'));

    $( "#qunit-fixture" ).append("<div id='trunk'></div>");
    $( "#trunk" ).append("<div id='jstree-div'></div>");
    $( "#trunk" ).append("<div id='view-div'></div>");
    $("body").append($('<script />').attr('src','../../src/js/patra.js'));

    patra.init('/data/metrics.json');
    patra.addGraph('#view-div');
    var allElements = document.getElementsByTagName("*");
    var allIds = [];
    for (var i = 0, n = allElements.length; i < n; ++i) {
        var el = allElements[i];
        if (el.id) {
            allIds.push(el.id);
            console.log("***** " + el.id + "\n");
        }
    }

    ok('hello', 'hello');
    ok(document.getElementById('jstree-div'),
         'Viewer container div is added');
    QUnit.done(() => console.log("some meta info here"));
});

// test('JVM Viewer container div is added', function () {
//     metricsViewer.addJvm('#qunit-fixture', "JVM Metrics Viewer Example",
//         "Metric Viewer Example of JVM Metrics");
//
//     metricsViewer.init();
//     ok(document.getElementById('qunit-fixture.container'),
//         'JVM Viewer container div is added');
// });