import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';

const canvas= document.querySelector(".webgl")
const scene = new THREE.Scene();
const gui = new dat.GUI()

/**
 * Galaxy 
 */
const parameters={}
parameters.count=100000
parameters.size=0.01
parameters.radius=5
parameters.branches=3
parameters.spin=1
parameters.randomness=.2
parameters.randomnessPower=3
parameters.insideColor='#ff6030'
parameters.outsideColor='#1b3984'
parameters.rotationSpeed=0.05
parameters.anticlockwise= true


let geometry=null
let material = null 
let particles=null
const generateGalaxy = () =>{
    if(particles !== null ){
        // Remove already created galaxies
        geometry.dispose()
        material.dispose()
        scene.remove(particles)
    }
    
    geometry = new THREE.BufferGeometry()
    let positions = new Float32Array(parameters.count * 3 )
    let colors = new Float32Array(parameters.count * 3 )

    let colorInside = new THREE.Color(parameters.insideColor)
    let colorOutside = new THREE.Color(parameters.outsideColor)

    for( let i=0;i<parameters.count ; i++){
        // because positions.length = parameters.count * 3 and we are looping over i till parameters.count 
        const i3= i*3
    
        // radius of galaxy
        const radius = Math.random() * parameters.radius

        const randomX= Math.pow(Math.random() , parameters.randomnessPower)  * (Math.random() < 0.5 ? 1 : -1)
        const randomY= Math.pow(Math.random() , parameters.randomnessPower)  * (Math.random() < 0.5 ? 1 : -1)
        const randomZ= Math.pow(Math.random() , parameters.randomnessPower)  * (Math.random() < 0.5 ? 1 : -1)

        // amount of spin each line will get - farther the particle from center, more the spin
        const spinAngle = radius * parameters.spin 
        // angle of branch with each other
        const branchAngle =( i % parameters.branches / parameters.branches ) * Math.PI * 2

        // creating round branches (galaxy)
        positions[i3+0] = Math.cos(branchAngle + spinAngle) * radius  + randomX  //(Math.random() - 0.5) * radius
        positions[i3+1] = 0 + randomY
        positions[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ


        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside,radius/parameters.radius)

        // console.log(mixedColor)
        colors[i3]= mixedColor.r
        colors[i3+1]= mixedColor.g
        colors[i3+2]=mixedColor.b
    }
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3))
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3))
    material= new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    particles= new THREE.Points(geometry,material)
    scene.add(particles)
}
generateGalaxy()


gui.add(parameters,"count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters,"size").min(0.001).max(.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters,"radius").min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters,"branches").min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters,"spin").min(-5).max(5).step(.01).onFinishChange(generateGalaxy)
gui.add(parameters,"randomness").min(0).max(2).step(.001).onFinishChange(generateGalaxy)
gui.add(parameters,"randomnessPower").min(1).max(10).step(.001).onFinishChange(generateGalaxy)
gui.addColor(parameters,"insideColor").onFinishChange(generateGalaxy)
gui.addColor(parameters,"outsideColor").onFinishChange(generateGalaxy)
gui.add(parameters,"rotationSpeed").min(0.02).max(1).step(.001).onFinishChange(generateGalaxy)
gui.add(parameters,"anticlockwise").onFinishChange(generateGalaxy)




const sizes={
    width: window.innerWidth,
    height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

const controls= new OrbitControls(camera,canvas)
controls.enableDamping = true

window.addEventListener("resize",()=>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const renderer= new THREE.WebGLRenderer({canvas})
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio , 2))
renderer.render(scene,camera)


const clock = new THREE.Clock;


function animate(){
    const time  = clock.getElapsedTime();

    particles.rotation.y= time * parameters.rotationSpeed * (parameters.anticlockwise ? 1 : -1)
    controls.update();
    renderer.render(scene,camera)
    window.requestAnimationFrame(animate)

}
animate()
