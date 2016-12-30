Qt.include("three.js")
Qt.include("controls.js")

var camera, scene, renderer;
var cube;
var mesh;
var controls;
var light;

function initializeGL(canvas) {
    camera = new THREE.PerspectiveCamera(27, canvas.innerWidth/canvas.innerHeight, 1, 11000);

    camera.position.x = 1500;
    camera.position.y = 1500;
    camera.position.z = 1500;
    scene = new THREE.Scene();
    renderer = new THREE.Canvas3DRenderer({canvas: canvas, antialias: false, devicePixelRatio: canvas.devicePixelRatio});
    renderer.setClearColor(0x707070);
    renderer.setSize(canvas.width, canvas.height);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    scene.rotation.x = -Math.PI/2;
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 100, 100, 100 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -100, -100, 100 );
    scene.add( light );

    controls = new THREE.OrbitControls( camera, canvas);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
}

function resizeGL(canvas) {
    camera.aspect = canvas.width/canvas.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexClthoors});

    // Grid
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-500, 0, 0));
    geometry.vertices.push(new THREE.Vector3(500, 0, 0));

    var linesMaterial = new THREE.LineBasicMaterial(0x000000, 0.2);

    for ( var i = 0; i <= 20; i ++ ) {

        var line = new THREE.Line(geometry, linesMaterial);
        line.position.y = (i*50)-500;
        scene.add(line);

        var line = new THREE.Line(geometry, linesMaterial);
        line.position.x = (i*50)-500;
        line.rotation.z = 90*Math.PI/180;
        scene.add(line);
    }
}

function drawLine(pos) 
{
    var selectedObject = scene.getObjectByName("piece");
    scene.remove(selectedObject);

    var segments = pos.length;
    var lines = [];
    var travel = [];

    var geometry = new THREE.Geometry();

    console.time('criandoLista');
    for(var i=1; i< segments;i++)
    {
        if (pos[i].w != pos[i-1].w)
        {
            lines.push([new THREE.Vector3(pos[i-1].x, pos[i-1].y, pos[i-1].z),
                        new THREE.Vector3(pos[i].x, pos[i].y, pos[i].z)]);
        }
        else
        {
            travel.push([new THREE.Vector3(pos[i-1].x, pos[i-1].y, pos[i-1].z),
                        new THREE.Vector3(pos[i].x, pos[i].y, pos[i].z)]);
        }
    }

    console.timeEnd('criandoLista')

    console.time('criandoGeometria');
    for (var i=1; i < lines.length; i++)
    {
        geometry.merge(drawlineBetween(lines[i][0], lines[i][1], 0.4));
    }
    console.timeEnd('criandoGeometria')

    console.time("corrigindoPosicao");
    geometry.applyMatrix(new THREE.Matrix4().makeScale(5, 5, 5));
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-500, -500, 0));
    console.timeEnd("corrigindoPosicao");

    var material = new THREE.MeshLambertMaterial( { color: 0x000088, shading: THREE.SmoothShading } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.name = "piece";
    console.time("adding");
    scene.add(mesh);
    console.timeEnd("adding");

}

var lastDate = 0;
function paintGL(canvas) {
    var time = Date.now()*0.001;
    // required if controls.enableDamping = true, or if controls.autoRotate = true
    controls.update();
    renderer.render(scene, camera);
}

function urlToFileName(url) {
    var splited = String(url).split('/');
    var file = splited[splited.length - 1];
    return file.split('.')[0];
}

function onMouseMove(mouse){
    controls.onMouseMove(mouse);
}

function onPressed(mouse){
    controls.onMouseDown(mouse);
}

function onReleased(mouse){
    controls.onMouseUp(mouse);
}

function onMouseWheel(mouse){
    controls.onMouseWheel(mouse);
}


function drawlineBetween(point1, point2, width)
{
    var direction = (point2.clone().sub(point1)).normalize();
    var offset = direction.multiplyScalar(width);

    // side 1
    var extreme1 = point1.clone().sub(offset);

    var top1 = point1.clone().setZ(point1.z + width/2);
    var bottom1 = point1.clone().setZ(point1.z - width/2);

    var side_dir = direction.clone().cross(new THREE.Vector3(0,0,1)).normalize().multiplyScalar(width);

    var left1 = point1.clone().add(side_dir);
    var right1 = point1.clone().sub(side_dir);

    ///side 2
    var extreme2 = point2.clone().add(offset);

    var top2 = point2.clone().setZ(point2.z + width/2);
    var bottom2 = point2.clone().setZ(point2.z - width/2);

    var left2 = point2.clone().add(side_dir);
    var right2 = point2.clone().sub(side_dir);


    var geometry = new THREE.Geometry();
    geometry.vertices.push(extreme1);   //0
    geometry.vertices.push(top1);       //1
    geometry.vertices.push(bottom1);    //2
    geometry.vertices.push(left1);      //3
    geometry.vertices.push(right1);     //4
    geometry.vertices.push(extreme2);   //5
    geometry.vertices.push(top2);       //6
    geometry.vertices.push(bottom2);    //7
    geometry.vertices.push(left2);      //8
    geometry.vertices.push(right2);     //9

    geometry.faces.push(new THREE.Face3(3,1,0),
                        new THREE.Face3(1,4,0),
                        new THREE.Face3(3,0,2),
                        new THREE.Face3(2,0,4),
                        new THREE.Face3(1,6,4),
                        new THREE.Face3(6,9,4),
                        new THREE.Face3(1,3,6),
                        new THREE.Face3(8,6,3),
                        new THREE.Face3(2,7,3),
                        new THREE.Face3(7,8,3),
                        new THREE.Face3(7,4,9),
                        new THREE.Face3(4,7,2),
                        new THREE.Face3(8,6,3),
                        new THREE.Face3(6,8,5),
                        new THREE.Face3(9,6,5),
                        new THREE.Face3(5,8,7),
                        new THREE.Face3(5,7,9));


    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;

}