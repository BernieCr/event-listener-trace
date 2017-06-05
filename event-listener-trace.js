// ==UserScript==
// @name         Event Listener Trace Tool
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Trace which function registered an event listener, including call stack
// @author       Bernhard Caspar
// @match        http*://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log('eventListenerTrace initialized. Available commands: addEventListenerList() addEventListenerShow()');

    window.addEventListenerLog = [];

    var d = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(eventName, eventHandler) {
        d.apply(this, arguments);
        var err = new Error();
        var stack = err.stack.split('\n');
        stack.splice(0,2);
        stack = stack.join('\n');
        //console.log(eventName, this, stack);

        var eventLog = {
            type: eventName,
            target: this,
            handler: eventHandler.toString(),
            stack: stack
        };
        addEventListenerLog.push(eventLog);
    };

    window.addEventListenerList = function(target) {
        if (!target) {
            console.log('Syntax: addEventListenerList(target)\nExample: addEventListenerList(document)\n       addEventListenerList($0)');
            return;
        }
        var listEvents = function(node) {
            var nodeEvents = window.addEventListenerLog.filter(function(el) {
                return el.target == target;
            }).map(function(el) {
                return el.type;
            });
            if (nodeEvents.length) {
                console.log('Events: ' + nodeEvents.join(', ') + ' for', node);
            }
        };
        listEvents(target);
        console.log('-------------------------------');
        console.log('Events for parent nodes:');
        while (target) {
            target = target.parentNode;
            listEvents(target);
        }
    };

    window.addEventListenerShow = function(target, eventName, showDocumentAndBody) {
        
        if (!(target && eventName)) {
            console.log('Syntax: addEventListenerShow(target, eventName)\nExample: addEventListenerShow(document, \'DOMContentLoaded\')\n       addEventListenerShow($0, \'click\')');
            return
        }
        
        
        var showEvents = function(node) {
            var nodeEvents = window.addEventListenerLog.filter(function(el) {
                return (el.target == target) && (el.type == eventName);
            });
            if (nodeEvents.length) {
                var i = 1;
                nodeEvents.forEach(function(el) {
                    console.log(eventName + ' handler #' + i + ' for ', target);
                    console.log('   ', el.handler);
                    console.log(el.stack);
                    console.log('');
                    i++;
                });
                console.log('');
                console.log('');
            }
            return (!!nodeEvents.length);
        };
        console.log('');
        console.log('');
        if (!showEvents(target)) {
            console.log('No ' + eventName + ' handlers for ', target);
            console.log('');
        }
        console.log('-------------------------------');
        console.log(eventName + ' for parent nodes:');
        console.log('');
        while (target) {
            target = target.parentNode;
            if ((target == document) || (target == document.body)) {
                if (showDocumentAndBody) {
                    showEvents(target);
                }
            }
            else {
                showEvents(target);
            }
        }
    };
    
	})();