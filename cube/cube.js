"use strict";

var KEYCODE_q = 81;
var KEYCODE_w = 87;
var KEYCODE_e = 69;
var KEYCODE_a = 65;
var KEYCODE_s = 83;
var KEYCODE_d = 68;
var KEYCODE_z = 90;
var KEYCODE_x = 88;
var KEYCODE_c = 67;
var KEYCODE_r = 82;
var KEYCODE_f = 70;
var KEYCODE_g=71;
var KEYCODE_h=72;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
const green = vec4(0.0, 1.0, 0.0, 1.0 );
const blue = vec4(0.0, 0.0, 1.0, 1.0);
const magenta = vec4(1.0, 0.0, 1.0, 1.0);
const cyan = vec4(0.0, 1.0, 1.0, 1.0);
const white = vec4(1.0, 1.0, 1.0, 1.0);

var canvas;
var gl;

var points = [];
var colors = [];
var fColor;

var axis = 0;
var r_axis = [0,0,0];
var r_theta = mat4();
var program;
var sign=1;
var animating=null;
var r_thetaLoc;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var near = -20;
var far = 40;
var radius = 15.0;
var dr = 5.0 * Math.PI/180.0;
var theta,phi;
theta = phi = 2*dr;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var vBuffer,vPosition;
var rotnum = 0;
var myCube;
window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    r_axis =[1,0,0];
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    try {
    var isFileSaverSupported = !!new Blob;
    } catch (e) {
      alert("FileSaver not supported!")
    }

    myCube=new Cube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    r_thetaLoc = gl.getUniformLocation(program, "r_theta");
    fColor = gl.getUniformLocation(program, "fColor");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    //event listeners for buttons
    myCube.cube_render();
    document.addEventListener('keydown',keycontrol);
    document.getElementById( "Randomize" ).onclick = function () {
      if((rotnum==0)||(rotnum==NaN)){
        if(document.getElementById("rot_num_input").value != ''){
          rotnum = parseInt(document.getElementById("rot_num_input").value);
        }else{
          rotnum = 0;
        }
        randomize();
      }else{
        console.log("Still rotating!");
      }
    };
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      //document.getElementById( "Load" ).onclick = function () {load();};
      document.getElementById( "Save" ).onclick = function () {save();};
      document.getElementById('files').addEventListener('change', handleFileSelect, false);
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
    document.getElementById( "Reset" ).onclick = function () {reset();};
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function keycontrol(event){

  if(((event.keyCode == KEYCODE_q)
  ||(event.keyCode == KEYCODE_w)
  ||(event.keyCode == KEYCODE_e)
  ||(event.keyCode == KEYCODE_a)
  ||(event.keyCode == KEYCODE_s)
  ||(event.keyCode == KEYCODE_d)
  ||(event.keyCode == KEYCODE_z)
  ||(event.keyCode == KEYCODE_x)
  ||(event.keyCode == KEYCODE_c)
  ||(event.keyCode == KEYCODE_r)
  ||(event.keyCode == KEYCODE_f)
  ||(event.keyCode == KEYCODE_g)
  ||(event.keyCode == KEYCODE_h)) && (animating!=1)) {
    myCube.curr_rot=[
       vec3(0,0,0),
       vec3(0,0,0),
       vec3(0,0,0)
     ];
    if(event.keyCode == KEYCODE_q) {
      myCube.curr_rot[0][0]=90;
    }
    else if(event.keyCode == KEYCODE_w) {
      myCube.curr_rot[0][1]=90;
    }
    else if(event.keyCode == KEYCODE_e) {
      myCube.curr_rot[0][2]=90;
    }
    else if(event.keyCode == KEYCODE_a) {
      myCube.curr_rot[1][0]=90;
    }
    else if(event.keyCode == KEYCODE_s) {
      myCube.curr_rot[1][1]=90;
    }
    else if(event.keyCode == KEYCODE_d) {
      myCube.curr_rot[1][2]=90;
    }
    else if(event.keyCode == KEYCODE_z) {
      myCube.curr_rot[2][2]=90;
    }
    else if(event.keyCode == KEYCODE_x) {
      myCube.curr_rot[2][1]=90;
    }
    else if(event.keyCode == KEYCODE_c) {
      myCube.curr_rot[2][0]=90;
    }else if(event.keyCode == KEYCODE_f) {
      myCube.curr_rot[0][0]=90;
      myCube.curr_rot[0][1]=90;
      myCube.curr_rot[0][2]=90;
    }else if(event.keyCode == KEYCODE_g) {
      myCube.curr_rot[1][0]=90;
      myCube.curr_rot[1][1]=90;
      myCube.curr_rot[1][2]=90;
    }else if(event.keyCode == KEYCODE_h) {
      myCube.curr_rot[2][0]=90;
      myCube.curr_rot[2][1]=90;
      myCube.curr_rot[2][2]=90;
    }else if(event.keyCode == KEYCODE_r){
      sign *= -1;
      console.log("sign: "+sign);
    }
    for(var i=0;i<myCube.curr_rot.length;i++){
      for (var j=0;j<myCube.curr_rot[i].length;j++){
        myCube.curr_rot[i][j] *= sign;
      }
    }
    cube_rotate();
  }
}
class Cube {
  constructor(){
    this.cubies=[];
    this.indices=[];
    for(var i=0;i<27;i++){
      this.indices.push(i);
    }
    this.curr_rot = [
      vec3(0,0,0),
      vec3(0,0,0),
      vec3(0,0,0)
    ];
    this.t = [
      vec3( -1, -1, -1),
      vec3( -1, -1,  0),
      vec3( -1, -1,  1),
      vec3( -1,  0, -1),
      vec3( -1,  0,  0),
      vec3( -1,  0,  1),
      vec3( -1,  1, -1),
      vec3( -1,  1,  0),
      vec3( -1,  1,  1),
      vec3(  0, -1, -1),
      vec3(  0, -1,  0),
      vec3(  0, -1,  1),
      vec3(  0,  0, -1),
      vec3(  0,  0,  0),
      vec3(  0,  0,  1),
      vec3(  0,  1, -1),
      vec3(  0,  1,  0),
      vec3(  0,  1,  1),
      vec3(  1, -1, -1),
      vec3(  1, -1,  0),
      vec3(  1, -1,  1),
      vec3(  1,  0, -1),
      vec3(  1,  0,  0),
      vec3(  1,  0,  1),
      vec3(  1,  1, -1),
      vec3(  1,  1,  0),
      vec3(  1,  1,  1),
    ];
    for(var i=0;i<this.t.length;i++){
        var c = new Cubie(this.t[i]);
        this.cubies.push(c);
    }
  }

  isSolved(){
    var solved=false;
    var indices = new Array(10);
    for(var i=0;i<3;i++){
      for(var j=0;j<3;j++){
        indices[i*3 +j] = new Array();
        for(var k=0;k<27;k++){
          indices[i*3 +j].push(k);
        }
        var curr_rot = [
          vec3(0,0,0),
          vec3(0,0,0),
          vec3(0,0,0)
        ];
        for (var k=0;k<3;k++){
          curr_rot[i][k] = 90;
        }
        var ind = i*3 +j;
        for(var k=0;k<j+1;k++){
          for (var l=0;l<3;l++){
            update_pos(indices[i*3+j],i,l,curr_rot);
          }
          console.log(ind+" rotating");
        }
      }
    }
    indices[9] = new Array();
    for(var i=0;i<27;i++){
      indices[9].push(i);
    }
    for(var i=0;i<indices.length;i++){
      if(arraysEqual(indices[i],myCube.indices)){
          solved = true;
      }
    }
    return solved;
  }
  cube_render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for(var i=0;i<this.cubies.length;i++){
      points = [];
      for(var j=0;j<this.cubies[this.indices[i]].points.length;j++){
        points.push(this.cubies[this.indices[i]].points[j]);
      }
      //r_theta = mat4();
      for(var j=0;j<this.cubies[this.indices[i]].rot.length;j++){
        for(var k=0;k<this.cubies[this.indices[i]].rot[j].length;k++){
          r_theta[j][k] = this.cubies[this.indices[i]].rot[j][k];
        }
      }
      render();
    }
  }

}

function update_pos(indices,i,j,curr_rot){
  var plane = plane_inds(i,j);
  var shuf1=[];
  var shuf2=[];
  var seq1 = [6,8,2,0];
  var seq2 = [5,1,3,7];
  var m = 1;
  if(i==1){
    m *=-1;
  }
  if(curr_rot[i][j]*m==90){
    for(var k=0;k<seq1.length;k++){
      shuf1.push(plane[seq1[k]]);
    }
    for(var k=0;k<seq2.length;k++){
      shuf2.push(plane[seq2[k]]);
    }

  }else if(curr_rot[i][j]*m==-90){
    for(var k=seq1.length-1;k>=0;k--){
      shuf1.push(plane[seq1[k]]);
    }
    for(var k=seq1.length-1;k>=0;k--){
      shuf2.push(plane[seq2[k]]);
    }
  }
  shuffle(indices,shuf1);
  shuffle(indices,shuf2);
  //return indices;
}

function cube_rotate(){
  if(animating==1){
    //console.log("already rotating");
    return;
  }else{
    for( var i=0;i<myCube.curr_rot.length;i++){
      for(var j=0;j<myCube.curr_rot[i].length;j++){
        if(Math.abs(myCube.curr_rot[i][j]) == 90){
          var inds = plane_inds(i,j);
          update_pos(myCube.indices,i,j,myCube.curr_rot);
          for(var k=0;k<inds.length;k++){
            for(var l=0;l<3;l++){
              if(l==i){
                myCube.cubies[myCube.indices[inds[k]]].to_rot[l] += myCube.curr_rot[i][j];
              }else {
                myCube.cubies[myCube.indices[inds[k]]].to_rot[l] = 0;
              }
            }

          }

        }
      }
    }

    cube_rotate_step();
    if(myCube.isSolved()){
      console.log("solved it!");
      document.getElementById("issolved").innerHTML = '<strong>Solved it!</strong>';
    }else{
      document.getElementById("issolved").innerHTML = '';
    }
  }
}

function plane_inds(i,j){
  var planeno = 3*i + j;
  var inds=[];
  var x,y,z;
  x=y=z=-1;
  if(planeno==0){x=0;}
  else if(planeno==1){x=1;}
  else if(planeno==2){x=2;}
  else if(planeno==3){y=0;}
  else if(planeno==4){y=1;}
  else if(planeno==5){y=2;}
  else if(planeno==6){z=0;}
  else if(planeno==7){z=1;}
  else if(planeno==8){z=2;}

    for(var k=0;k<myCube.t.length;k++){
    if(x>=0){

      if(myCube.t[k][0]+1 == x){
        inds.push(k);
      }
    }else if(y>=0){
      if(myCube.t[k][1]+1 == y){
        inds.push(k);
      }
    }else if(z>=0){
      if(myCube.t[k][2]+1 == z){
        inds.push(k);
      }
    }
  }
  return inds;
}

function map_rotation(curr,axis,degree){
  var new_rotation = [0,0,0];
  new_rotation[axis]=degree;
  /*90 deg x:
  z=>y ,y=>-z
  180 deg x:
  z=>-z ,y=>-y
  270 deg x:
  z=>-y ,y=>z*/
  /*
  90 deg y:
  x=>z, z=>-x
  180 deg y:
  x=>-x, z=>-z
  270 deg y:
  x=>-z, z=>x*/
  /*
  90 deg z:
  y=>x,x=>-y
  180 deg z:
  y=>-y,x=>-
  270 deg z:
  y=>-x,x=>y*/

  /*
  if(curr[0]==90){
    swap(new_rotation,1,2);
    new_rotation[2] *= -1;
  }else if(curr[0]==180){
    new_rotation[1] *= -1;
    new_rotation[2] *= -1;
  }else if(curr[0]==270){
    swap(new_rotation,1,2);
    new_rotation[1] *= -1;
  }
  */

  if(curr[1]==90){
    swap(new_rotation,0,2);
    new_rotation[0] *= -1;
  }else if(curr[1]==180){
    new_rotation[0] *= -1;
    new_rotation[2] *= -1;
  }else if(curr[1]==270){
    swap(new_rotation,0,2);
    new_rotation[2] *= -1;
  }
  if(curr[2]==90){
    swap(new_rotation,0,1);
    new_rotation[1] *= -1;
  }else if(curr[2]==180){
    new_rotation[0] *= -1;
    new_rotation[1] *= -1;
  }else if(curr[2]==270){
    swap(new_rotation,0,1);
    new_rotation[0] *= -1;
  }

  return new_rotation;
}

function swap(arr,x,y){
  var s = arr[x];
  arr[x]=arr[y];
  arr[y]=s;
}

function shuffle(arr,inds){
  var s=arr[inds[0]];
  var s2;
  for(var i=0;i<inds.length;i++){
    var n=i+1;
    if(n==inds.length){
      n=0;
    }

    s2=arr[inds[n]];
    arr[inds[n]]=s;
    s=s2;

  }
}

function cube_rotate_step(){
  animating=1;
  var inc=9 ;
  var nonzero =false;
  for(var i=0;i<myCube.cubies.length;i++){
    for(var j=0;j<3;j++){
      if(myCube.cubies[i].to_rot[j] != 0){
        nonzero=true;
        if(((myCube.cubies[i].to_rot[j] < 0)&&(inc>0))
        ||((myCube.cubies[i].to_rot[j] > 0)&&(inc<0))){
          inc *= -1;
        }
        //myCube.cubies[i].rot[j] += inc;

        myCube.cubies[i].to_rot[j] -= inc;
        var cos = Math.cos(inc/180*Math.PI);
        var sin = Math.sin(inc/180*Math.PI);
        var newrot;
        if(j==0){
            newrot = mat4( 1.0,  0.0,  0.0, 0.0, //row major
                           0.0,  cos, -sin, 0.0,
                           0.0,  sin,  cos, 0.0,
                           0.0,  0.0,  0.0, 1.0 );
        }else if(j==1){
          newrot = mat4( cos, 0.0, sin, 0.0,
                         0.0, 1.0,  0.0, 0.0,
                         -sin,0.0,  cos, 0.0,
                         0.0, 0.0,  0.0, 1.0 );
        }else if(j==2){
          newrot = mat4( cos, -sin, 0.0, 0.0,
                         sin,  cos, 0.0, 0.0,
                         0.0,  0.0, 1.0, 0.0,
                         0.0,  0.0, 0.0, 1.0 );
        }
        myCube.cubies[i].rot = mult(newrot,myCube.cubies[i].rot);
      }
    }
  }

  if(nonzero){
    myCube.cube_render();
    requestAnimFrame(cube_rotate_step);
  }else{
    animating=0;
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
        var indices = [ a, b, c, d ];
        for ( var i = 0; i < indices.length; ++i ) {
            this.points.push( vertices[indices[i]] );
        }
        colors.push(vertexColors[a]);
      }
      constructor(x,y,z){
        this.rot = mat4();
        this.to_rot = [0,0,0];
        this.loc = vec3(x,y,z);
        this.points = [];
        this.quad( 1, 0, 3, 2 );
        this.quad( 2, 3, 7, 6 );
        this.quad( 3, 0, 4, 7 );
        this.quad( 6, 5, 1, 2 );
        this.quad( 4, 5, 6, 7 );
        this.quad( 5, 4, 0, 1 );
        this.translate(x,y,z);
    }
    translate(x,y,z){
      if (!x) x=[0,0,0];
      for ( var i = 0; i < this.points.length; ++i ) {
        this.points[i] = mult(translate(x,y,z),this.points[i]);
      }
    }
}

function randomize(){
  if(animating==1){
    setTimeout(randomize,50);
    return;
  }
  if(rotnum>0){
    var a=Math.floor(Math.random()*3);
    var b=Math.floor(Math.random()*3);
    myCube.curr_rot=[
       vec3(0,0,0),
       vec3(0,0,0),
       vec3(0,0,0)
     ];

    myCube.curr_rot[a][b]=90;
    cube_rotate();
    rotnum--;
    randomize();
  }else{
    console.log("Done randomizing!");
  }
}

//--load/save functions
function save(){
  var blob = new Blob([JSON.stringify(myCube)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "cubestate.json");
}
function reset(){
  myCube = new Cube();
  myCube.cube_render();
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function handleFileSelect(evt) {
    var files = evt.target.files;
    if (!files.length) {
      alert('Please select a file!');
      return;
    }
    var output = [];
    var f = files[0];
    var start = 0;
    var stop = f.size-1;
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        var jsonArr=[];
        for(var i=0;i<evt.target.result.length;i++){
          jsonArr.push(evt.target.result[i]);
        }
        for(var i=0;i<3;i++){
          jsonArr.shift();
        }
        var jsonStr = jsonArr.join('');

        if(!IsJsonString(jsonStr)){
          alert('must be a JSON file! Please select again');
          return;
        }
        var loadedCube = JSON.parse(jsonStr);
        for(var i=0;i<myCube.cubies.length;i++){
          for(var j=0;j<myCube.cubies[i].rot.length;j++){
            for(var k=0;k<myCube.cubies[i].rot[j].length;k++){
              myCube.cubies[i].rot[j][k] = loadedCube.cubies[i].rot[j][k];
            }
          }
          for(var j=0;j<myCube.cubies[i].loc.length;j++){
            myCube.cubies[i].loc[j] = loadedCube.cubies[i].loc[j];
          }
        }
        for(var i=0;i<myCube.indices.length;i++){
          myCube.indices[i] = loadedCube.indices[i];
        }
        myCube.cube_render();
      }
    };

    output.push(f.size, ' bytes, last modified: ',
    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');
    document.getElementById('list').innerHTML = output.join('');
    var blob = f.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

function change_view(theta_arg,phi_arg,sign){
  if(theta_arg){
    theta += sign*dr;
  }
  if(phi_arg){
    phi += sign*dr;
  }
  if((theta_arg!=false)||(phi_arg!=false)){
    myCube.cube_render();
  }
}

function render(){
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

   var eyex,eyey,eyez;
   eyex=radius*Math.cos(phi)*Math.cos(theta);
   eyey=radius*Math.cos(phi)*Math.sin(theta);
   eyez=radius*Math.sin(phi);
   var eye = vec3(eyex,eyey,eyez);
    var modelViewMatrix = lookAt( eye, at, up );
    var projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.uniformMatrix4fv(r_thetaLoc,false,flatten(r_theta));
    //6 faces 4 points each
    for(var i=0; i<points.length; i+=4) {
        gl.uniform4fv(fColor, flatten(colors[i/4]));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

}
