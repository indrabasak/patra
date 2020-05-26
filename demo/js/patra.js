/**
 * patra - Patra is a collection of HTML, JavaScript, and CSS assets for viewing Dropwizard (Codehale/Yammer) metrics.
 * @version v2.0.0
 * @author Indra Basak
 * @license Apache-2.0
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'MG', 'jstree'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('MG'), require('jstree'));
  } else {
    root.patra = factory(root.jQuery, root.MG, root.jstree);
  }
}(this, function($, MG, jstree) {
/**
 *
 * @file Patra is used for viewing Drop Wizard metrics in an user friendly way.
 *
 * @name patra
 * @namespace patra
 *
 * @author Indra Basak
 * @since November 2016
 * @license Apache-2.0
 */
(function (patra, $) {
    'use strict';

    /**
     * Initializes Patra with the URL to fetch metrics
     * @function
     * @name patra#init
     *
     * @param url URL to fetch metrics
     */
    patra.init = function (url) {
        if (!_initialized) {
            _initialized = true;
            _url = url;
            _keepRefreshing();
        }
    };

    /**
     * Called by the viewer to display a graph
     * @function
     * @name patra#addGraph
     *
     * @param divId {string} div id where the graph will be displayed in the viewer
     */
    patra.addGraph = function (divId) {
        if (_$selectedNode && _$selectedNode.data.key) {
            var title = _$selectedNode.data.key;
            var description = "";
            var metricName = _$selectedNode.data.key;

            if (_$selectedNode.data.type === METRIC_TYPE.COUNTER) {
                metricsViewer.addCounter(divId, title, description, metricName);
            } else if (_$selectedNode.data.type === METRIC_TYPE.GAUGE) {
                metricsViewer.addGauge(divId, title, description, metricName);
            } else if (_$selectedNode.data.type === METRIC_TYPE.METER) {
                if (_$selectedNode.data.value) {
                    title = title + "." + _$selectedNode.text;
                    metricsViewer.addMeterWithProperty(divId, title, description,
                        metricName, _$selectedNode.text);
                } else {
                    metricsViewer.addMeter(divId, title, description, metricName);
                }
            } else if (_$selectedNode.data.type === METRIC_TYPE.TIMER) {
                if (_$selectedNode.data.value) {
                    title = title + "." + _$selectedNode.text;
                    metricsViewer.addTimerWithProperty(divId, title, description,
                        metricName, _$selectedNode.text);
                } else {
                    metricsViewer.addTimer(divId, title, description, metricName);
                }
            }

            metricsViewer.init();
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Types of metrics
     * @enum {Object}
     *
     */
    var METRIC_TYPE = {
        COUNTER: {type: "counters"},
        GAUGE: {type: "gauges"},
        METER: {type: "meters"},
        TIMER: {type: "timers"}
    };
    Object.freeze(METRIC_TYPE);

    /**
     * The div id of the left panel where the tree is displayed
     * @type {string}
     */
    var _treedId = '#jstree-div';
    Object.freeze(_treedId);

    /**
     * The div id of the right panel where the metrics graph is displayed
     * @type {string}
     */
    var _viewerId = '#trunk-div';
    Object.freeze(_viewerId);

    /**
     * CSS class of the input search field
     * @type {string}
     */
    var _searchClass = '.input-tree';
    Object.freeze(_searchClass);

    /**
     * Flag for checking if Patra has been initialized
     * @type {boolean} true if initialized
     * @private
     */
    var _initialized = false;

    /**
     * URL to fetch metrics
     */
    var _url;

    //noinspection JSUnresolvedFunction
    /**
     * Map which hold the tree node paths. The key holds the node path, while the value hold the parent path.
     * Avoids insertion of duplicate tree nodes
     * @type {Map}
     */
    var _metricsMap = new Map();

    /**
     * The root of the metric tree
     */
    var _$root;

    /**
     * The selected tree node
     */
    var _$selectedNode;

    //set the active viewer and section on first load/
    /**
     @type {string}
     */
    var currentPage = (document.location.hash) ? document.location.hash.slice(1) : 'patra-tree';

    $('#trunk').load(currentPage + '.html', function () {
        if (currentPage === "patra-tree") {
            _initializeTree();
        }
    });

    $('.docs li a#goto-' + currentPage).addClass('active');

    /**
     * Listens to events generated from clicks on navigation links.
     * Displays the page (metric tree or JVM metrics) based on the link clicked.
     * The link clicked is made active.
     * @private
     */
    var _assignEventListeners = function () {
        $('ul.docs li a.viewer').on('click', function (event) {
            event.preventDefault();

            //remove the active viewer from the trunk div
            $('ul.docs li a.viewer').removeClass('active');
            $(this).addClass('active');

            //clear the old div tags
            metricsViewer.clear();

            //get the name of the viewer, stars after 'goto-' phrase
            var currentPage = /** @type {string} */ ($(this).attr('id').slice(5));
            $('#trunk').load(currentPage + '.html', function () {
                if (currentPage === "patra-tree") {
                    _initializeTree();
                }
            });

            document.location.hash = currentPage;

            return false;
        });
    };

    //handle mouse clicks and so on
    _assignEventListeners();

    /**
     * Calls the tree _refresh method once the page is read. It makes calls to fetch metric data
     * from the server
     */
    // $(function () {
    //     _keepRefreshing();
    // });

    /**
     * Loads the viewer page when it's ready
     */
    $(_viewerId).load('patra-viewer.html', function () {
    });

    /**
     * Initializes the metric tree. Clears the metric map before creating a new tree.
     * @private
     */
    var _initializeTree = function () {
        //noinspection JSUnresolvedFunction
        _metricsMap.clear();
        metricsViewer.clear();

        _$root = $(_treedId).jstree({
            "core": {
                check_callback: true,
                "themes":  {
                    "name": "proton",
                    "responsive": true
                }
            },
            "ui": {},
            "types": {
                "key": {
                    "icon": "fa fa-folder-open-o fa-line-chart icon-blue"
                },
                "value": {
                    "icon": "fa fa-line-chart icon-green"
                },
                "value-str": {
                    "icon": "fa fa-leaf icon-green"
                },
                "default": {
                    "icon": "fa fa-folder icon-manila"
                }
            },
            "plugins": ["search", "sort", "types"]
        });

        /**
         * Displays a corresponding metrics graph based on node selected
         */
        $(_treedId).on('select_node.jstree', function (e, data) {
            _displayViewer(data);
        });

        /**
         * Display an open folder icon when open node
         */
        $(_treedId).on('open_node.jstree',
            /**
             * @suppress {missingProperties}
             */
            function (e, data) {
            if (data.node.type !== 'key') {
                //noinspection JSUnresolvedFunction
                data.instance.set_icon(data.node, "fa fa-folder-open-o icon-manila");
            }
        });

        /**
         * Display an close folder icon when close node
         */
        $(_treedId).on('close_node.jstree',
            /**
             * @suppress {missingProperties}
             */
            function (e, data) {
            if (data.node.type !== 'key') {
                //noinspection JSUnresolvedFunction
                data.instance.set_icon(data.node, "fa fa-folder icon-manila");
            }
        });

        /**
         * Filters the tree node based on input search text
         */
        $(_searchClass).keyup(function () {
            var searchString = $(this).val();
            $(_treedId).jstree('search', searchString);
        });
    };

    /**
     * Adds metric tree
     * @param jsonData jsonData {object} metric data as json object
     * @private
     */
    var _addTree = function(jsonData) {
        for (var key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                for (var typeKey in METRIC_TYPE) {
                    if (METRIC_TYPE.hasOwnProperty(typeKey)) {
                        var metricType = METRIC_TYPE[typeKey];
                        if (key === metricType.type) {
                            _addMetricTree(metricType, jsonData);
                        }
                    }
                }
            }
        }
    };

    /**
     * Adds a metric root node based on metric type
     * @param metricType {METRIC_TYPE} metricType the type of metric class
     * @param jsonData {object} metric data as json object
     * @private
     */
    var _addMetricTree = function (metricType, jsonData) {
        //noinspection JSUnresolvedVariable
        var jsonNode = jsonData[metricType.type];
        //noinspection JSUnresolvedVariable
        var typeId = metricType.type;
        //noinspection JSUnresolvedFunction
        if (!_metricsMap.has(typeId)) {
            //noinspection JSUnresolvedVariable
            _addNode(metricType, "#", typeId, metricType.type, false, false, false);
            //noinspection JSUnresolvedFunction
            _metricsMap.set(typeId, "#");
        }

        var parentId;
        var id = typeId;
        $.each(jsonNode, function (key, val) {
            id = typeId;
            var tokens = key.split(".");
            for (var i = 0; i < tokens.length; i++) {
                parentId = id;
                id = id + "." + tokens[i];
                //noinspection JSUnresolvedFunction
                if (!_metricsMap.has(id)) {
                    if (i === (tokens.length - 1)) {
                        _addNode(metricType, parentId, id, tokens[i], true, false, false);
                    } else {
                        _addNode(metricType, parentId, id, tokens[i], false, false, false);
                    }
                    //noinspection JSUnresolvedFunction
                    _metricsMap.set(id, parentId);
                }
            }

            parentId = id;
            $.each(val, function (k, v) {
                id = parentId + "." + k;
                //noinspection JSUnresolvedFunction
                if (!_metricsMap.has(id)) {
                    var numeric = $.isNumeric(v);
                    _addNode(metricType, parentId, id, k, false, true, numeric);
                    //noinspection JSUnresolvedFunction
                    _metricsMap.set(id, parentId);
                }
            });
        });
    };

    /**
     * Adds a metric tree node
     * @param metricType {METRIC_TYPE} metricType the type of metric class
     * @param parentId {string} node id (metric path) of the parent node
     * @param childId {string} id of the node to be added
     * @param childTxt {string} name of the child node
     * @param key {boolean} true if the node can be displayed in a metric graph
     * @param metricValue {boolean} true if the node represents a metric value
     * @param numeric {boolean} true if the value is numeric
     * @private
     */
    var _addNode = function (metricType, parentId, childId, childTxt, key, metricValue, numeric) {
        var $parentNode = _$root.jstree(true).get_node(parentId);
        var childData;
        var data;
        if (metricValue) {
            if (numeric) {
                childData = {"id": childId, "text": childTxt, "type": "value"};
            } else {
                childData = {"id": childId, "text": childTxt, "type": "value-str"};
            }
            data = {"type": metricType, "key": _retrieveKey(metricType, parentId), "value": true};
        } else {
            if (key) {
                childData = {"id": childId, "text": childTxt, "type": "key"};
                data = {"type": metricType, "key": _retrieveKey(metricType, childId), "value": false};
            } else {
                childData = {"id": childId, "text": childTxt};
                data = {"type": metricType, "key": null, "value": false};
            }
        }

        _$root.jstree(true).create_node($parentNode, childData);
        var $node = _$root.jstree(true).get_node(childId);
        $node.data = data;
    };

    /**
     * Creates the key to retrieve the json node from the metric data.
     * The metric class name is stripped from the path
     * @param metricType {METRIC_TYPE} metricType the type of metric class
     * @param path the path of the tree node
     * @returns {string} the metric key
     * @private
     */
    var _retrieveKey = function (metricType, path) {
        var key = "";

        for (var typeKey in METRIC_TYPE) {
            if (METRIC_TYPE.hasOwnProperty(typeKey)) {
                var mType = METRIC_TYPE[typeKey];
                if (metricType === mType) {
                    //noinspection JSUnresolvedVariable
                    key = path.substring(metricType.type.length + 1);
                    return key;
                }
            }
        }

        return key;
    };

    /**
     * Refreshes the metric tree and graph after every 2 sec
     * @private
     */
    var _keepRefreshing = function () {
        _refreshXmlHttp();
        setInterval(_refreshXmlHttp, 2000);
    };

    /**
     * Makes an ajax call to fetch metrics via jquery.
     * Doesn't work for CORS
     * @private
     */
    var _refreshJQuery = function () {
        //var url = "metrics/metrics";
        //$.support.cors = true;
        $.ajax({
            // contentType: "application/json",
            url: _url,
            method: 'GET',
            dataType: "json",
            cache: false,
            headers: {
                //accept: 'application/json; charset=UTF-8',
                'Cache-Control': 'max-age=1000'
            },
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: function (data) {
                _updatePage(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Error - " + xhr.status + "Message: " + thrownError);
            },
            async: true
        });
    };

    /**
     * Makes ajax call to retrieve metrics via XMLHttpRequest
     * @private
     */
    var _refreshXmlHttp = function () {
        var xhr = new XMLHttpRequest();
        try {
            xhr.open('GET', _url, true);
            xhr.setRequestHeader('accept', 'application/json; charset=UTF-8');
            xhr.withCredentials = false;
            xhr.onload = function () {
                if (this.status == 200) {
                    _updateTrafficLight(true);
                    if (this.responseText && !_isEmpty(this.responseText)) {
                        try {
                            var jsonResponse = JSON.parse(this.responseText);
                            _updatePage(jsonResponse);
                        } catch (err) {}
                    }
                }
            };
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status == 200) {
                        _updateTrafficLight(true);
                        if (this.responseText && !_isEmpty(this.responseText)) {
                            try {
                                var jsonResponse = JSON.parse(this.responseText);
                                _updatePage(jsonResponse);
                            } catch (err) {}
                        }
                    } else {
                        _updateTrafficLight(false);
                    }
                }
            };
            xhr.send();
        } catch (e) {
            _updateTrafficLight(false);
        }
    };

    /**
     * Test method to fetch metric data from a file
     * @private
     */
    var _refreshGetJson = function () {
        $.getJSON('../data/metrics.json', function (data) {
            _updatePage(data);
        });
    };

    /**
     * Changes the color of traffic light based on server response
     * @param on {boolean} true when receiving metrics from the server
     * @private
     */
    var _updateTrafficLight = function (on) {
        var $trafficSpan = $('#traffic').find('span');
        if (on) {
            if ($trafficSpan.hasClass('icon-red')) {
                $trafficSpan.removeClass('icon-red');
                $trafficSpan.addClass('icon-green');
            }
        } else {
            if ($trafficSpan.hasClass('icon-green')) {
                $trafficSpan.removeClass('icon-green');
                $trafficSpan.addClass('icon-red');
            }
        }
    };

    /**
     * Updates the viewer page - either overview otr JVM
     * @param data metrics json data
     * @private
     */
    var _updatePage = function (data) {
        metricsViewer.refresh(data);
        if (_$root) {
            _addTree(data);
        }
    };

    /**
     * Displays metric graph based on the selected tree node
     * @param data
     * @private
     */
    var _displayViewer = function (data) {
        _$selectedNode = data.node;
        metricsViewer.clear();

        $(_viewerId).load('patra-viewer.html', function () {
        });
    };

    /**
     * Checks if a string is empty
     * @param str {string} string to be checked
     * @returns {boolean} true if the string is empty
     * @private
     */
    var _isEmpty = function (str) {
        return (!str || 0 === str.length);
    };

}(window.patra = window.patra || {}, jQuery));
return patra;
}));
