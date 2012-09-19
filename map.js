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
	
	
	this.option = OptionType.APPEND;
	
	this.setOption = function( option ) {
		this.option = option;
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
      
		var linePath = new eniro.maps.MapArray([pos, points.getAt(nearestId)]);
		
		var line = new eniro.maps.Polyline({
                    map: this.map,
                    path: linePath,
                    strokeColor: "#ffaaaa"
                });

			var so = this;
      eniro.maps.event.addListener(this.map, 'click', function (evt) {
				if( so.option == OptionType.APPEND ) {
              var index = points.getLength();
              points.push(evt.latLng);
              
              markers.push( so.makeDraggableMarker(points,index, evt.latLng, icon, markers) );
              printThem(markers,points);
				}
      });
      
      eniro.maps.event.addListener(this.map, 'click', function (evt) {
				if( so.option == OptionType.INSERT ) {
              markers.push( so.insertDraggableMarker(points, evt.latLng, icon, markers) );
              printThem(markers,points);
				}
      });
      
      eniro.maps.event.addListener(this.map, 'mousemove', function (evt) {
				if( so.option == OptionType.INSERT ) {
             so.shortestLineToPoint(points, evt.latLng );
				}
      });
	}
	
	this.shortestLineToPoint = function(points, pos ) {
		var nearestId = findNearest( points, pos );
		

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
        
        /*
        i1l = distance( points.getAt( i1 ), pos );
        i2l = distance( points.getAt( i2 ), pos );
        
        ddd.value = "Distance 1: " + i1l + "\n" + ddd.value;
        ddd.value = "Distance 2: " + i2l + "\n" + ddd.value;
        */
        
        var smallest = smallestSlope( points.getAt( nearestId ), pos, points.getAt( i1 ), points.getAt( i2 ) );
        
        var id = i1+1;
        if( smallest == 1 ) {
        	ddd.value = "Smallest: " + i1 + "\n" + ddd.value;
        	this.wedgeAt( points, markers, i1+1, pos );
        } else {
        	ddd.value = "Smallest: " + i2 + "\n" + ddd.value;
        	this.wedgeAt( points, markers, i2, pos );
        	var id = i2;
        }
        

        // When marker is being dragged, the polygon should be updated.
        eniro.maps.event.addListener(marker, 'drag', function (evt) {
        	if( so.option == OptionType.MOVE ) {
            points.setAt(markers.getAt(thisid).pointid, marker.getPosition());
          }
        });
        
        var so = this;
        eniro.maps.event.addListener(marker, 'click', function (evt) {
        	if( so.option == OptionType.DELETE ) {
            deleteMarker(thisid, markers, points);
          }
        });
        
        ddd.value = "[" + id + "]" + pos + "\n" + ddd.value;
        
        /*
        var infoWindow = new eniro.maps.InfoWindow();
				eniro.maps.event.addListener(marker, 'mouseover', function () {

                  // set the content as either HTML or a DOM node.
                  infoWindow.setContent( printMarker( markers.getAt(thisid) ) );

                  // open the window on the marker.
                  infoWindow.open(marker);
                  
              });  
              
				eniro.maps.event.addListener(marker, 'mouseout', function () {
                  // open the window on the marker.
                  infoWindow.close(marker);
                  
              }); 
              */             

			return { marker: marker, id: thisid, pointid: id };
    };
    
    // 1   2   3   4   (5)
    // 
    
    this.wedgeAt = function( points, markers, index, pos ) {
    	//points.push( points.getAt( pos ) );
    	var ddd = document.getElementById( "text" );
    	ddd.value = "Wedging at " + index + "\n" + ddd.value;
    	
    	points.push( pos );
    	for( var i = ( points.getLength() - 1 ) ; i >= 0  ; i-- ) {
    		if( i == index ) {
    			ddd.value = "Wedge found at " + i + "\n" + ddd.value;
    			points.setAt( i, pos );
    			break;
    		}
    		
    		var b = points.getAt( i-1 );
    		points.setAt( i, b );
    		
    		/* Update */
    		//ddd.value = "Updating marker @ " + i + "\n" + ddd.value;
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

				var so = this;
        // When marker is being dragged, the polygon should be updated.
        eniro.maps.event.addListener(marker, 'drag', function (evt) {
        	if( so.option == OptionType.MOVE ) {
            points.setAt(markers.getAt(thisid).pointid, marker.getPosition());
          }
        });
        
        
        eniro.maps.event.addListener(marker, 'click', function (evt) {
        	if( so.option == OptionType.DELETE ) {
            deleteMarker(thisid, markers, points);
          }
        });
        
        /*
        var infoWindow = new eniro.maps.InfoWindow();
				eniro.maps.event.addListener(marker, 'mouseover', function () {

                  // set the content as either HTML or a DOM node.
                  //infoWindow.setContent("Marker: " + markers.getAt(thisid).id + ", " + markers.getAt(thisid).pointid);
                  infoWindow.setContent( printMarker( markers.getAt(thisid) ) );

                  // open the window on the marker.
                  infoWindow.open(marker);
                  
              }); 
              
				eniro.maps.event.addListener(marker, 'mouseout', function () {
                  // open the window on the marker.
                  infoWindow.close(marker);
                  
              });
              */
        
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

function printThem( markers, points ) {
	var ddd = document.getElementById( "points" );
	ddd.value = "";
	printMarkers( markers );
	ddd.value += "\n";
	printPoints( points );
}

function printPoints( points ) {
	var ddd = document.getElementById( "points" );
	ddd.value += "Points(" + points.getLength() + ")\n-------------\n";
	for( var i = 0 ; i < points.getLength() ; i++ ) {
		ddd.value += "[" + i + "] " + points.getAt( i ) + "\n";
	}
}

function printMarkers( markers ) {
	var ddd = document.getElementById( "points" );
	ddd.value += "Markers(" + markers.getLength() + ")\n-------------\n";
	for( var i = 0 ; i < markers.getLength() ; i++ ) {
		ddd.value += "[" + i + "] ";
		ddd.value += "ID: " + markers.getAt( i ).id;
		ddd.value += ", PID: " + markers.getAt( i ).pointid;
		ddd.value += "\n";
	}
}

function printMarker( marker ) {
	return "Marker id: " + marker.id + "\nPoint id: " + marker.pointid;
}

function findNearest( points, p ) {
	var i = 0;
	var bi = 0;
	var shortest = 10000000.0;
	
	var ddd = document.getElementById( "text" );
	ddd.value = "Finding nearest\n" + ddd.value;
	
	for( ; i < points.getLength() ; i++ ) {
		var l = distance( p, points.getAt( i ) );
		
		ddd.value = "[" + i + "] " + l + " / " + shortest + "\n" + ddd.value;
		
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
			//var ddd = document.getElementById( "text" );
    	//ddd.value = "MARKER(" + i + ") UPDATE before " + before + ", now: " + now + "\n" + ddd.value;
			markers.getAt( i ).pointid = now;
			break;
		}
	}
}

function deleteMarker( markerId, markers, points ) {
  var ddd = document.getElementById( "text" );
  
  var marker = markers.getAt( markerId );
  
  ddd.value = "Deleting marker@" + markerId + " pointing to " + marker.pointid + " of " + (markers.getLength()+1) + "\n" + ddd.value;
  
	marker.marker.setDraggable( false );
	points.removeAt( marker.pointid );
	marker.marker.setVisible( false );
	
	/**/
	for( var i = 0 ; i < markers.getLength() ; i++ ) {
		if( markers.getAt( i ).pointid > marker.pointid ) {
			markers.getAt( i ).pointid--;
		}
	}
	
	//ddd.value = "Deleted marker@" + markerId + " of " + markers.getLength() + "\n" + ddd.value;
	printThem( markers, points );
}

/**
 *  n : The nearest point found
 *  p : The new point
 *  p1: n-1
 *  p2: n+1
 * 
 *  Returns
 */
function smallestSlope( n, p, p1, p2 ) {
	var s1_1 = slope( p1, n ); // Slope 
	var s1_2 = slope( p1, p ); // Slope 
	
	var s2_1 = slope( p2, n ); // Slope 
	var s2_2 = slope( p2, p ); // Slope 
	var sn = slope( n, p );
	
	//var a1 = angleTwoLines( s1_1, s1_2 );
	//var a2 = angleTwoLines( s2_1, s2_2 );
	
	var a1 = angleTwoLines( s1_2, s1_1 );
	var a2 = angleTwoLines( s2_2, s2_1 );
	
  var ddd = document.getElementById( "text" );
	ddd.value = "Angle 1*: " + a1 + ", Angle 2*: " + a2 + "\n" + ddd.value;
	
	var side1a = side( n, p1, p );
	var side1b = side( p2, p1, p );
	
	var side2a = side( n, p2, p );
	var side2b = side( p1, p2, p );
	
	var cross1 = ( side1a > 0 ? ( side1b > 0 ? false : true ) : side1b > 0 ? true : false );
	var cross2 = ( side2a > 0 ? ( side2b > 0 ? false : true ) : side2b > 0 ? true : false );
	
	ddd.value = "Side 1a: " + side1a + ", side 1b: " + side1b + " crossing=" + cross1 + "\n" + ddd.value;
	ddd.value = "Side 2a: " + side2a + ", side 2b: " + side2b + " crossing=" + cross2 + "\n" + ddd.value;
	
	
	
	if( ( !cross1 && !cross2 ) || ( cross1 && cross2 ) ) {
		var o1 = obtuseTriangle( p1, n, p );
		var o2 = obtuseTriangle( p2, n, p );
		
	ddd.value = "Obtuse 1: " + o1 + "\n" + ddd.value;
	ddd.value = "Obtuse 2: " + o2 + "\n" + ddd.value;
		if( ( o1 && o2 ) || ( !o1 && !o2 ) ) {
			if( a1 < 0 && a2 < 0 ) {
				if( a1 > a2 ) {
					return 1;
				} else {
					return 2;
				}
			} else if( a1 < 0 && a2 >= 0 ) {
				return 2;
			} else if( a1 >= 0 && a2 < 0 ) {
				return 1;
			} else {
				if( a1 < a2 ) {
					return 1;
				} else {
					return 2;
				}
			}
		} else if( o1 ) {
			return 1;
		} else {
			return 2;
		}
	} else if( cross1 ) {
		return 2;
	} else {
		return 1;
	}
	
	//alert( "a1: " + a1 + ", a2: " + a2 );
	/*
	if( Math.abs( a1 ) < Math.abs( a2 ) ) {
		return 1;
	} else {
		return 2;
	}
	*/
}

function slope( p1, p2 ) {
	return ( p2.getLat() - p1.getLat() ) / ( p2.getLng() - p1.getLng() );
}

function angleTwoLines( m1, m2 ) {
	return (m1-m2) / (1+m1*m2);
}

function side( point, p1, p2 ) {
	return ( point.getLat() - p1.getLat() ) * ( p2.getLng() - p1.getLng() ) - ( point.getLng() - p1.getLng() ) * ( p2.getLat() - p1.getLat() );
}

function obtuseTriangle( p1, n, p ) {
	var p1p = distance( p1, p );
	var p1n = distance( p1, n );
	
  var ddd = document.getElementById( "text" );
	ddd.value = "p1-p: " + p1p + ", p1-n: " + p1n + "\n" + ddd.value;
	
	return p1n>p1p;
}

function obtuseTriangle2( p1, n, p ) {
	var a = distance( p1, p );
	var b = distance( n, p );
	var c = distance( p1, n );
	
	return (a*a+b*b)<c*c;
}
	
	
var OptionType = {
	MOVE: {},
	INSERT: {},
	APPEND: {},
	DELETE: {}
}