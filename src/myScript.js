// 3.58 - 4.24
import * as THREE from 'three' ;
import * as dat from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const canvas = document.querySelector(".webgl");
const scene= new THREE.Scene()
const gui = new dat.GUI();


const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color: 'grey'})
)
// scene.add(cube)
const parameters={}
parameters.count=100000
parameters.size=0.01
parameters.radius=5
parameters.branches=3
parameters.spin=0.1
parameters.randomness=0.1
parameters.randomnessPower=3
parameters.insideColor="#ff6030"
parameters.outsideColor="#1b3984"



let geometry=null
let material=null
let particles= null

const generateGalaxy = () => {
    if(particles != null ){
        geometry.dispose()
        material.dispose()
        scene.remove(particles)
    }
    geometry= new THREE.BufferGeometry()
    material= new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    const positions = new Float32Array(parameters.count*3)
    const colors = new Float32Array(parameters.count*3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i=0;i<parameters.count;i++){
        const i3 = i*3
        const radius  = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches / parameters.branches) * Math.PI * 2
        const spinAngle = radius * parameters.spin

        // const randomX = (Math.random() - 0.5) * parameters.randomness * radius
        // const randomY = (Math.random() - 0.5) * parameters.randomness * radius
        // const randomZ = (Math.random() - 0.5) * parameters.randomness * radius
        const randomX = Math.pow( Math.random() , parameters.randomnessPower ) * (Math.random() < 0.5 ? 1 : -1) 
        const randomY = Math.pow( Math.random() , parameters.randomnessPower ) * (Math.random() < 0.5 ? 1 : -1) 
        const randomZ = Math.pow( Math.random() , parameters.randomnessPower ) * (Math.random() < 0.5 ? 1 : -1) 

        
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside,radius/ parameters.radius)

        colors[i3+0] = mixedColor.r 
        colors[i3+1] = mixedColor.g 
        colors[i3+2] = mixedColor.b

        positions[i3+0] = Math.cos( branchAngle + spinAngle ) * radius + randomX
        positions[i3+1] =0 + randomY
        positions[i3+2] =  Math.sin(branchAngle + spinAngle) * radius + randomZ
    }
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3))
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3))
    particles  = new THREE.Points(geometry,material)
    scene.add(particles)
} 
generateGalaxy()

gui.add(parameters,"count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters,"size").min(0.001).max(.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters,"radius").min(1).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters,"branches").min(2).max(10).step(1).onFinishChange(generateGalaxy)
gui.add(parameters,"spin").min(-5).max(5).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters,"randomness").min(0.01).max(10).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters,"randomnessPower").min(2).max(10).step(1).onFinishChange(generateGalaxy)
gui.addColor(parameters,"insideColor").onFinishChange(generateGalaxy)
gui.addColor(parameters,"outsideColor").onFinishChange(generateGalaxy)

const sizes= {
    width: window.innerWidth,
    height: window.innerHeight
}
const camera= new THREE.PerspectiveCamera(75, sizes.width/sizes.height,0.1,100)
camera.position.x=2
camera.position.y=3
camera.position.z=3
scene.add(camera)

const controls= new OrbitControls(camera,canvas)
// scene.add(controls)

window.addEventListener("resize",()=>{
    sizes.width= window.innerWidth
    sizes.height= window.innerHeight

    camera.aspect= sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

const renderer= new THREE.WebGLRenderer({canvas})
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.render(scene,camera)


const clock= new THREE.Clock();
function tick(){
    
    const time = clock.getElapsedTime();

    particles.rotation.y= time * .5
    controls.update()
    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)
}
tick()