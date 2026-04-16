import * as THREE from 'three'

const parameters = {
    materialColor: '#a600ff'
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

const shapeGroup = new THREE.Group()
scene.add(shapeGroup)

const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.44, 22, 90),
    material
)
shapeGroup.add(mesh)

const ambientLight = new THREE.AmbientLight('#ffffff', 1.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#d9b3ff', 3.6)
directionalLight.position.set(2, 2, 3)
scene.add(directionalLight)

const fillLight = new THREE.PointLight('#7b2dff', 18, 14)
fillLight.position.set(-2.5, -1, 2.5)
scene.add(fillLight)

const particlesCount = 180
const particlesGeometry = new THREE.BufferGeometry()
const particlePositions = new Float32Array(particlesCount * 3)
const particleSpeeds = new Float32Array(particlesCount)
const particleDrift = new Float32Array(particlesCount)

for(let i = 0; i < particlesCount; i++)
{
    particlePositions[i * 3] = (Math.random() - 0.5) * 12
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 11
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1.5
    particleSpeeds[i] = 0.18 + Math.random() * 0.28
    particleDrift[i] = Math.random() * Math.PI * 2
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: '#e4d1ff',
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 6)
cameraGroup.add(camera)

const updateLayout = () =>
{
    const isMobile = sizes.width <= 900

    camera.position.z = isMobile ? 7.4 : 6
    shapeGroup.position.x = isMobile ? 0 : 2.45
    shapeGroup.position.y = isMobile ? 1.7 : 0.25
}

updateLayout()

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    updateLayout()

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const pointer = {
    x: 0,
    y: 0
}

const target = {
    rotationX: 0,
    rotationY: 0,
    positionX: 0,
    positionY: 0,
    cameraX: 0,
    cameraY: 0,
    scale: 1
}

const resetInteraction = () =>
{
    pointer.x = 0
    pointer.y = 0
    target.rotationX = 0
    target.rotationY = 0
    target.positionX = 0
    target.positionY = 0
    target.cameraX = 0
    target.cameraY = 0
    target.scale = 1
}

const setPointer = (clientX, clientY) =>
{
    pointer.x = clientX / sizes.width - 0.5
    pointer.y = clientY / sizes.height - 0.5

    target.rotationY = pointer.x * 0.9
    target.rotationX = pointer.y * 0.5
    target.positionX = pointer.x * 0.18
    target.positionY = - pointer.y * 0.14
    target.cameraX = pointer.x * 0.05
    target.cameraY = - pointer.y * 0.04
    target.scale = 1 + Math.abs(pointer.x) * 0.015 + Math.abs(pointer.y) * 0.012
}

window.addEventListener('pointermove', (event) =>
{
    setPointer(event.clientX, event.clientY)
})

window.addEventListener('pointerleave', () =>
{
    resetInteraction()
})

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    mesh.rotation.x += ((0.72 + target.rotationX) - mesh.rotation.x) * 0.022
    mesh.rotation.y += ((elapsedTime * 0.24 + target.rotationY) - mesh.rotation.y) * 0.022
    mesh.rotation.z += 0.0015

    const baseX = sizes.width <= 900 ? 0 : 2.45
    const baseY = sizes.width <= 900 ? 1.7 : 0.25

    shapeGroup.position.x += ((baseX + target.positionX) - shapeGroup.position.x) * 0.03
    shapeGroup.position.y += ((baseY + target.positionY + Math.sin(elapsedTime * 1.1) * 0.07) - shapeGroup.position.y) * 0.03

    cameraGroup.position.x += (target.cameraX - cameraGroup.position.x) * 0.025
    cameraGroup.position.y += (target.cameraY - cameraGroup.position.y) * 0.025

    mesh.scale.x += (target.scale - mesh.scale.x) * 0.03
    mesh.scale.y += (target.scale - mesh.scale.y) * 0.03
    mesh.scale.z += (target.scale - mesh.scale.z) * 0.03

    for(let i = 0; i < particlesCount; i++)
    {
        const xIndex = i * 3
        const yIndex = xIndex + 1

        particlePositions[yIndex] -= particleSpeeds[i] * deltaTime
        particlePositions[xIndex] += Math.sin(elapsedTime * 0.7 + particleDrift[i]) * 0.0008

        if(particlePositions[yIndex] < -5.8)
        {
            particlePositions[yIndex] = 5.8
            particlePositions[xIndex] = (Math.random() - 0.5) * 12
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true
    particles.rotation.y = elapsedTime * 0.02

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
