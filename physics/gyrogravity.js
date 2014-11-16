'use strict';

/*
Copyright 2014 Ralph Thomas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function GyroVelocityDemo(element) {
    element.classList.add('gyro-gravity');

    var clip = document.createElement('div');
    clip.className = 'gyro-clip';

    var img = document.createElement('div');
    img.className = 'gyro-img';

    clip.appendChild(img);

    var metadata = document.createElement('div');
    metadata.className = 'gyro-metadata';

    var progress = document.createElement('div');
    progress.className = 'gyro-progress';
    metadata.appendChild(progress);

    var thumb = document.createElement('div');
    thumb.className = 'gyro-thumb';
    progress.appendChild(thumb);

    var attribution = document.createElement('div');
    attribution.className = 'gyro-attribution';
    attribution.innerHTML = '<a href="https://www.flickr.com/photos/claudioaccheri/15442177417"><b>Stonehenge</b> by <b>Claudio Accheri</b> on Flickr<br>Creative Commons BY-NC</a>';
    //attribution.innerHTML = 'Photo <a href="https://www.flickr.com/photos/jonwestra78/8735498522">Stonehenge by Jon Westra</a>, CC BY-NC-SA';
    metadata.appendChild(attribution);

    clip.appendChild(metadata);


    element.appendChild(clip);

    // Velocity simulation; the velocity changes regularly from the gyro.
    function ClampedVelocity(min, max) {
        this._velocity = 0;
        this._position = 0;
        this._startTime = (new Date()).getTime();
        this._min = min;
        this._max = max;
    }
    ClampedVelocity.prototype.x = function() {
        var delta = ((new Date()).getTime() - this._startTime) / 1000.0;
        var p = this._position - delta * this._velocity;
        if (p < this._min) p = this._min;
        if (p > this._max) p = this._max;
        return p;
    }
    ClampedVelocity.prototype.progress = function() {
        return 1 - (this.x() - this._min) / (this._max - this._min);
    }
    ClampedVelocity.prototype.done = function() { return false; }
    ClampedVelocity.prototype.reconfigure = function(v) {
        if (v == this._velocity) return;
        this._position = this.x();
        this._startTime = (new Date()).getTime();
        this._velocity = v;
    }

    var max = 1280 - 320;
    var progressMax = 300 - 80;

    var model = new ClampedVelocity(-max, 0);

    this._animation = animation(model, function() {
        var transform = 'translateX(' + model.x() + 'px) translateZ(0)';
        img.style.webkitTransform = transform;
        img.style.transform = transform;

        var progressTransform = 'translateX(' + model.progress() * progressMax + 'px) translateZ(0)';
        thumb.style.webkitTransform = progressTransform;
        thumb.style.transform = progressTransform;
    });

    // This is a really crummy hack to find the single axis which is
    // interesting. Really we should do more math here and normalize
    // the vector and find the angle that interests us...
    function getInterestingAcceleration(e) {
        if (window.screen && window.screen.orientation) {
            var angle = window.screen.orientation.angle;
            if (angle == 0 || angle == 180)
                return e.accelerationIncludingGravity.x;
            return e.accelerationIncludingGravity.y;
        }
        // No screen orientation; assume it's iOS and use the
        // aspect ratio instead.
        var x = e.accelerationIncludingGravity.x;
        var y = e.accelerationIncludingGravity.y;
        if (window.innerWidth < window.innerHeight)
            return x;
        return y;
    }


    window.addEventListener('devicemotion',
        function(e) {
            var accel = getInterestingAcceleration(e);
            model.reconfigure(accel * 200);
        } ,
        true);
}

window.addEventListener('load', function() { new GyroVelocityDemo(document.getElementById('gyroVelocityExample')); }, false);