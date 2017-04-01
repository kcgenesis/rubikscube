"use strict";

var canvas;
var gl;

var VERTICES_PER_CUBIE  = 36;
var NUM_CUBIE = 2;
var points = [];
var colors = [];
var fColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var r_theta = [ 0, 0, 0 ];
var deg=null;

var r_thetaLoc;
var NumVertices = VERTICES_PER_CUBIE*NUM_CUBIE;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
const green = vec4(0.0, 1.0, 0.0, 1.0 );
const blue = vec4(0.0, 0.0, 1.0, 1.0);
const magenta = vec4(1.0, 0.0, 1.0, 1.0);
const cyan = vec4(0.0, 1.0, 1.0, 1.0);
const white = vec4(1.0, 1.0, 1.0, 1.0);

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //colorCube();
    //var cubie1 = new Cubie();
    //var cubie2 = new Cubie();

    //translation by +/- z hides part of cubie2's faces...
    //maybe im intersecting them with the camera.s
    //perhaps look into viewing to see how to avoid this issue
    cubie2.cubie_translate(1.1,0,-2);
    //console.log(cubie1.points);
    //console.log(cubie2.points);
    cubie1.create();
    cubie2.create();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //var cBuffer = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );


    //var vColor = gl.getAttribLocation( program, "vColor" );
    //gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    r_thetaLoc = gl.getUniformLocation(program, "r_theta");
    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
        requestAnimFrame(cube_rotate);
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
          requestAnimFrame(cube_rotate);
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
          requestAnimFrame(cube_rotate);
    };

    render();
}
class Cube {
  var cubie_plane = [
      vec3( -1,  0,  1),
      vec3(  0,  0,  1),
      vec3(  1,  0,  1),
      vec3( -1,  0,  0),
      vec3(  0,  0,  0),
      vec3(  1,  0,  0),
      vec3( -1,  0, -1),
      vec3(  0,  0, -1),
      vec3(  1,  0, -1),


  ];
}
class Cubie {
      quad(a,b,c,d){
        var vertices = [
            vec4( -0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5, -0.5, -0.5, 1.0 ),
            vec4( -0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5, -0.5, -0.5, 1.0 )
        ];
        var vertexColors = [
            [ 0.0, 0.0, 0.0, 1.0 ],  // black
            [ 1.0, 0.0, 0.0, 1.0 ],  // red
            [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
            [ 0.0, 1.0, 0.0, 1.0 ],  // green
            [ 0.0, 0.0, 1.0, 1.0 ],  // blue
            [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
            [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
            [ 1.0, 1.0, 1.0, 1.0 ]   // white
        ];
        //var indices = [ a, b, c, a, c, d ];
        var indices = [ a, b, c, d ];
        for ( var i = 0; i < indices.length; ++i ) {
            this.points.push( vertices[indices[i]] );
            //colors.push( vertexColors[indices[i]] );
            // for solid colored faces use
        }
        colors.push(vertexColors[a]);
      }
      //2 triangles per quad
      //6 vertices per quad
      //6 quads per cubie

      constructor(){
        this.points = [];
        //this.colors = [];
        this.quad( 1, 0, 3, 2 );
        this.quad( 2, 3, 7, 6 );
        this.quad( 3, 0, 4, 7 );
        this.quad( 6, 5, 1, 2 );
        this.quad( 4, 5, 6, 7 );
        this.quad( 5, 4, 0, 1 );
      }
    create(){
      for ( var i = 0; i < this.points.length; ++i ) {
        points.push(this.points[i]);
        //colors.push(this.colors[i]);
      }
    }
    cubie_translate(x,y,z){

      for ( var i = 0; i < this.points.length; ++i ) {
        //console.log(this.points[i]);
        this.points[i] = mult(translate(x,y,z),this.points[i]);
        //console.log(this.points[i]);
        //console.log("-----");

      }
    }
}
/*
function cube_rotate(deg){
  if(!deg) deg=0;


    deg += 2.0;
    r_theta[axis] += 2.0;
    if(r_theta[axis] >= 360) r_theta[axis] -= 360;
    render();
    if(deg<90){
      requestAnimFrame(cube_rotate);
    }



}
*/
function cube_rotate(){
  if(!deg){
    deg=0.0;

  }
  deg += 2.0;
  r_theta[axis] += 2.0;
  if(r_theta[axis] >= 360) r_theta[axis] -= 360;
  render();
  if (deg<90) {
    requestAnimFrame(cube_rotate);
  }else{
    deg=null;
  }
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    var modelViewMatrix = lookAt( eye, at, up );
    var projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


    gl.uniform3fv(r_thetaLoc, r_theta);

    //6 vertices for two triangles
    for(var i=0; i<points.length; i+=4) {
        gl.uniform4fv(fColor, flatten(colors[i/4]));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }


    //gl.drawArrays( gl.TRIANGLES, 0, NumVertices );



}
