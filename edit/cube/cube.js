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
var r_plane = [0,0,0,0,0,0,0,0,0];
var deg=null;
var pos=null;
var animating =null;
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

var near = -20;
var far = 40;
var radius = 15.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //var cubie1 = new Cubie();
    //var cubie2 = new Cubie(1.1,0,-2);

    //cubie1.create();
    //cubie2.create();

    //var myCube = new Cubie_plane();
    //myCube.create();

    var myCube = new Cube();
    myCube.create();

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

    document.getElementById( "xButton" ).onclick = function () {rotate(xAxis,1);};
    document.getElementById( "yButton" ).onclick = function () {rotate(yAxis,1);};
    document.getElementById( "zButton" ).onclick = function () {rotate(zAxis,1);};
    document.getElementById( "nxButton" ).onclick = function () {rotate(xAxis,-1);};
    document.getElementById( "nyButton" ).onclick = function () {rotate(yAxis,-1);};
    document.getElementById( "nzButton" ).onclick = function () {rotate(zAxis,-1);};
    document.getElementById( "Button1" ).onclick = function () {theta += dr;};
    document.getElementById( "Button2" ).onclick = function () {theta -= dr;};
    document.getElementById( "Button3" ).onclick = function () {phi += dr;};
    document.getElementById( "Button4" ).onclick = function () {phi -= dr;};
    document.getElementById( "Button4" ).onclick = function () {randomize();};
    document.getElementById( "pButton" ).onclick = function () {rotate(zAxis,-1);};


    animRender();
}
//creates rubiks cube at the origin
class Cube {
  constructor(){
    this.points = [];
    var cubie_plane_arr = [];
    var t2 = [
        vec3(  0,  1,  0),
        vec3(  0,  0,  0),
        vec3(  0, -1,  0)
    ];
    for(var i=0;i<3;i++){
      cubie_plane_arr.push(new Cubie_plane(t2[i]));
      for(var j=0;j<cubie_plane_arr[i].points.length;j++){
        this.points.push(cubie_plane_arr[i].points[j]);
      }
    }
  }
  create(){
    console.log(this.points);
    for(var i=0;i<this.points.length;i++){
      points.push(this.points[i]);
    }
  }
}


class Cubie_plane {
  constructor(x,y,z){
    this.points=[];
    var cubie_arr=[];
    var t1 = [
        vec3( -1,  0,  1),
        vec3(  0,  0,  1),
        vec3(  1,  0,  1),
        vec3( -1,  0,  0),
        vec3(  0,  0,  0),
        vec3(  1,  0,  0),
        vec3( -1,  0, -1),
        vec3(  0,  0, -1),
        vec3(  1,  0, -1)
    ];
    for(var i=0;i<9;i++){ //translate individuals
      cubie_arr.push(new Cubie(t1[i]));
    }
    for(var i=0;i<9;i++){ //translate group
      cubie_arr[i].cubie_translate(x,y,z);
      for(var j=0;j<cubie_arr[i].points.length;j++){
        this.points.push(cubie_arr[i].points[j]);
      }
    }
  }
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
      //creates subcube at defined pos or origin
      constructor(x,y,z){
        this.points = [];
        this.quad( 1, 0, 3, 2 );
        this.quad( 2, 3, 7, 6 );
        this.quad( 3, 0, 4, 7 );
        this.quad( 6, 5, 1, 2 );
        this.quad( 4, 5, 6, 7 );
        this.quad( 5, 4, 0, 1 );
        this.cubie_translate(x,y,z);
      }
    //create(){
      //for ( var i = 0; i < this.points.length; ++i ) {
      //  points.push(this.points[i]);
        //colors.push(this.colors[i]);
    //  }
  //  }
    cubie_translate(x,y,z){
      if (!x) x=[0,0,0];
      for ( var i = 0; i < this.points.length; ++i ) {
        //console.log(this.points[i]);
        this.points[i] = mult(translate(x,y,z),this.points[i]);
        //console.log(this.points[i]);
        //console.log("-----");

      }
    }
}

//apply a number of random rotations to the cube
function randomize(){

}

function rotate(arg_axis,arg_sign){
  if(animating==1){
    console.log("cant rotate");
    return;
  }
  axis = arg_axis;
  pos = arg_sign;
  requestAnimFrame(cube_rotate);
}














function cube_rotate(){

animating=1;
  if(!deg){deg=0.0;}

  deg += pos*2.0;
  r_theta[axis] += pos*2.0;
  if(r_theta[axis] >= 360) r_theta[axis] -= 360;
  if(r_theta[axis] < 0) r_theta[axis] += 360;
  render();
  if (pos*deg<90) {
    requestAnimFrame(cube_rotate);
  }else{
    deg=null;
    animating=0;
    animRender();
  }
}


//we can no longer send r_theta to the GPU
//there must be an r_theta for each in dividual cubie_plane.
function animRender(){
  render();
  requestAnimFrame(animRender);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /*
    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    var eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta),
         radius*Math.cos(phi));*/

         var eye = vec3(radius*Math.cos(theta)*Math.cos(phi),
                        radius*Math.cos(theta)*Math.sin(phi),
                        radius*Math.sin(theta));


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
