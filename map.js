function PraqmaMap( containerID, mapType, BBleft, BBbottom, BBright, BBtop ) {
		/* The element container id */
	this.containerID = containerID;
	/* The default map type */
	this.mapType     = mapType;
	/* Bounding box definitions */
	this.BBleft      = BBleft;
	this.BBbottom    = BBbottom;
	this.BBright     = BBright;
	this.BBtop       = BBtop;
	
		this.initializeMap = function() {
			var mapElement = document.getElementById( this.containerID );
			this.map = new eniro.maps.Map( mapElement );
			this.map.setFocus(true);
	}
	
	this.zoom = function() {
		var bounds = eniro.maps.LatLngBounds.make( this.BBleft, this.BBbottom, this.BBright, this.BBtop );
    this.map.fitBounds(bounds);
	}
	
	this.makePolygon = function( points, fillColor, strokeColor ) {
      // The icon
      var icon = new eniro.maps.MarkerImage(
              'http://kartor.eniro.se/media/markers/draw/crosshair.png',
              new eniro.maps.Size(20, 20), null, new eniro.maps.Point(10, 10));		
              
      var poly = new eniro.maps.Polygon({
          map: this.map,
          exterior: points,
          fillColor: fillColor,
          strokeColor: strokeColor,
          strokeWeight: 2
      });
              
      for( var i = 0 ; i < points.getLength() ; i++ ) {
				this.makeMarker( points.getAt(i), icon );
      }
	}
	
	this.drawing = true;
	
	this.enableDrawing = function() {
		this.drawing = true;
	}
	
	this.disableDrawing = function() {
		this.drawing = false;
	}
	
	this.inserting = false;
	
	this.enableInserting = function() {
		this.inserting = true;
	}
	
	this.disableInserting = function() {
		this.inserting = false;
	}
	
	
	this.drawPolygon = function() {
		
		var points = new eniro.maps.MapArray();
		var markers = new eniro.maps.MapArray();
		
      var icon = new eniro.maps.MarkerImage(
              'http://kartor.eniro.se/media/markers/draw/crosshair.png',
              new eniro.maps.Size(20, 20), null, new eniro.maps.Point(10, 10));	
		
      var poly = new eniro.maps.Polygon({
          map: this.map,
          exterior: points,
          strokeWeight: 2
      });

			var so = this;		
			
      eniro.maps.event.addListener(this.map, 'click', function (evt) {
				if( so.drawing ) {
              var index = points.getLength();
              points.push(evt.latLng);
              
              markers.push( so.makeDraggableMarker(points,index, evt.latLng, icon, markers) );
				}
      });
      
      eniro.maps.event.addListener(this.map, 'click', function (evt) {
				if( so.inserting ) {
              markers.push( so.insertDraggableMarker(points, evt.latLng, icon, markers) );
				}
      });
	}
	
	
    this.insertDraggableMarker = function( points, pos, icon, markers ) {

        var marker = new eniro.maps.Marker({
            position: pos,
            icon: icon,
            draggable: true,
            map: this.map
        });
        
        var thisid = markers.getLength();
        
        var nearestId = findNearest( points, pos );
        var i1 = nearestId - 1;
        var i2 = nearestId + 1;
        if( i1 < 0 ) {
        	i1 = points.getLength() - 1;
        }
        if( i2 >= points.getLength() ) {
        	i2 = 0;
        }
        
        var ddd = document.getElementById( "text" );
        ddd.value = "New point:" + pos + "\n" + ddd.value;
        ddd.value = "Values:" + "\n" + ddd.value;
        ddd.value = "1: " + i1 + "("+points.getAt( i1 )+")" + "\n" + ddd.value;
        ddd.value = "2: " + i2 + "("+points.getAt( i2 )+")" + "\n" + ddd.value;
        
        i1l = distance( points.getAt( i1 ), pos );
        i2l = distance( points.getAt( i2 ), pos );
        
        ddd.value = "Distance 1: " + i1l + "\n" + ddd.value;
        ddd.value = "Distance 2: " + i2l + "\n" + ddd.value;
        
        var id = i1;
        if( i1l < i2l ) {
        	this.wedgeAt( points, markers, i1+1, pos );
        } else {
        	this.wedgeAt( points, markers, i2+1, pos );
        	var id = i2;
        }
        

        // When marker is being dragged, the polygon should be updated.
        eniro.maps.event.addListener(marker, 'drag', function (evt) {
            points.setAt(markers.getAt(thisid).pointid, marker.getPosition());
        });
        
        ddd.value = "[" + id + "]" + pos + "\n" + ddd.value;        

			return { marker: marker, id: thisid, pointid: id };
    };
    
    // 1   2   3   4   (5)
    // 
    
    this.wedgeAt = function( points, markers, index, pos ) {
    	//points.push( points.getAt( pos ) );
    	points.push( pos );
    	for( var i = ( points.getLength() - 1 ) ; i >= 0  ; i-- ) {
    		if( i == index ) {
    			points.setAt( i, pos );
    			break;
    		}
    		
    		var b = points.getAt( i-1 );
    		points.setAt( i, b );
    		
    		/* Update */
    		updateMarkers( markers, i-1, i );
    	}
    }
    
    this.makeDraggableMarker = function( points, index, pos, icon, markers ) {

        var marker = new eniro.maps.Marker({
            position: pos,
            icon: icon,
            draggable: true,
            map: this.map
        });
        
        var thisid = markers.getLength();

        // When marker is being dragged, the polygon should be updated.
        eniro.maps.event.addListener(marker, 'drag', function (evt) {
            points.setAt(markers.getAt(thisid).pointid, marker.getPosition());
        });
        
        
        var ddd = document.getElementById( "text" );
        ddd.value = "[" + index + "]" + pos + "\n" + ddd.value;
        
			return { marker: marker, id: thisid, pointid: index };
    };
	
	this.makeMarker = function( pos, icon ) {
      var marker = new eniro.maps.Marker({
          position: pos,
          icon: icon,
          draggable: false,
          map: this.map
      });
      
      return marker;
  };	
  
}

function findNearest( points, p ) {
	var i = 0;
	var bi = 0;
	var shortest = 10000000.0;
	for( ; i < points.getLength() ; i++ ) {
		var l = distance( p, points.getAt( i ) );
		
		if( l < shortest ) {
			shortest = l;
			bi = i;
		}
	}
	
	return bi;
}

function distance( p1, p2 ) {
	// x=getLng
	var xs = p2.getLng() - p1.getLng();
	var ys = p2.getLat() - p1.getLat();
	var xs2 = Math.pow( ( xs ), 2 );
	var ys2 = Math.pow( ( ys ), 2 );
	return Math.sqrt( xs2 + ys2 );
}

function updateMarkers( markers, before, now ) {
	for( var i = 0 ; i < markers.getLength() ; i++ ) {
		if( markers.getAt( i ).pointid == before ) {
			markers.getAt( i ).pointid == now;
			break;
		}
	}
}
	